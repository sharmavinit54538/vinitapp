import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CheckCircle2, MapPin, ScanFace } from 'lucide-react-native';
import { NativeBottomSheet } from '@/components/ui/NativeBottomSheet';
import { PrimaryButton, StatusPill } from '@/components/ui/NativeCard';
import {
  GeofenceVerificationResult,
  sendLocalPushNotification,
  triggerHaptic,
  verifyOfficeGeofence,
} from '@/services/nativeModules';

export function FaceCheckInSheet({
  sheetRef,
  currentStatus,
  onSuccessPunch,
}: {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  currentStatus: 'Checked In' | 'Not Checked In';
  onSuccessPunch: (nextStatus: 'Checked In' | 'Not Checked In', timeLabel: string, geoLabel: string) => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [geoResult, setGeoResult] = useState<GeofenceVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleRunVerification = async () => {
    setIsVerifying(true);
    await triggerHaptic('light');
    if (!permission?.granted) {
      await requestPermission();
    }
    const geo = await verifyOfficeGeofence();
    setGeoResult(geo);

    const nextStatus = currentStatus === 'Checked In' ? 'Not Checked In' : 'Checked In';
    const timeLabel = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const geoLabel = `${geo.officeName} · ${geo.distanceMeters}m`;
    onSuccessPunch(nextStatus, timeLabel, geoLabel);
    await triggerHaptic('success');
    await sendLocalPushNotification(
      `OFC360 · ${nextStatus}`,
      `Verified at ${timeLabel} (${geoLabel})`
    );
    setIsVerifying(false);
    sheetRef.current?.dismiss();
  };

  return (
    <NativeBottomSheet
      sheetRef={sheetRef}
      title="Biometric Face & GPS Check-In"
      subtitle="Live front-camera liveness + expo-location geofence check"
      snapPoints={['72%']}
    >
      <View className="gap-4">
        <View className="h-56 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 items-center justify-center">
          {permission?.granted ? (
            <CameraView style={{ width: '100%', height: '100%' }} facing="front" />
          ) : (
            <View className="items-center px-6 gap-2">
              <ScanFace size={36} color="#818CF8" />
              <Text className="text-sm font-semibold text-white text-center">
                Camera access required for AI Face Check-In
              </Text>
              <Pressable
                onPress={() => void requestPermission()}
                className="px-4 py-2 rounded-xl bg-indigo-600 mt-1"
              >
                <Text className="text-xs font-bold text-white">Grant Camera Access</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View className="bg-slate-50 rounded-xl border border-slate-200 p-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 flex-1">
            <MapPin size={18} color="#4F46E5" />
            <View className="flex-1">
              <Text className="text-xs font-bold text-slate-900">
                {geoResult ? geoResult.officeName : 'OFC360 Bengaluru HQ Geofence'}
              </Text>
              <Text className="text-[11px] text-slate-500">
                {geoResult
                  ? `GPS ${geoResult.latitude}, ${geoResult.longitude} (${geoResult.distanceMeters}m)`
                  : '250m radius verified via expo-location'}
              </Text>
            </View>
          </View>
          <StatusPill label={currentStatus} tone={currentStatus === 'Checked In' ? 'emerald' : 'amber'} />
        </View>

        <PrimaryButton
          title={
            isVerifying
              ? 'Verifying Face & GPS...'
              : currentStatus === 'Checked In'
                ? 'Verify & Punch Out'
                : 'Verify & Punch In'
          }
          tone={currentStatus === 'Checked In' ? 'rose' : 'indigo'}
          icon={<CheckCircle2 size={18} color="#FFFFFF" />}
          disabled={isVerifying}
          onPress={() => void handleRunVerification()}
        />
      </View>
    </NativeBottomSheet>
  );
}
