import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { QrCode } from 'lucide-react-native';
import { NativeBottomSheet } from '@/components/ui/NativeBottomSheet';
import { PrimaryButton } from '@/components/ui/NativeCard';
import { triggerHaptic } from '@/services/nativeModules';

export function AssetQrScannerSheet({
  sheetRef,
  onScannedTag,
}: {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  onScannedTag: (tag: string) => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [manualTag, setManualTag] = useState('OFC-MBP-519');
  const [hasScanned, setHasScanned] = useState(false);

  const handleBarcode = (data: string) => {
    if (hasScanned) return;
    setHasScanned(true);
    void triggerHaptic('success');
    onScannedTag(data);
    sheetRef.current?.dismiss();
    setTimeout(() => setHasScanned(false), 600);
  };

  return (
    <NativeBottomSheet
      sheetRef={sheetRef}
      title="Scan IT Asset QR Sticker"
      subtitle="Point rear camera at OFC360 hardware barcode or enter tag"
      snapPoints={['72%']}
    >
      <View className="gap-4">
        <View className="h-56 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 items-center justify-center">
          {permission?.granted ? (
            <CameraView
              style={{ width: '100%', height: '100%' }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128'] }}
              onBarcodeScanned={(res) => handleBarcode(res.data)}
            />
          ) : (
            <View className="items-center px-6 gap-2">
              <QrCode size={36} color="#38BDF8" />
              <Text className="text-sm font-semibold text-white text-center">
                Enable camera to scan QR asset tags
              </Text>
              <Pressable
                onPress={() => void requestPermission()}
                className="px-4 py-2 rounded-xl bg-indigo-600 mt-1"
              >
                <Text className="text-xs font-bold text-white">Enable Camera</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View className="gap-2">
          <Text className="text-xs font-semibold text-slate-600">Manual Asset Tag Fallback</Text>
          <TextInput
            value={manualTag}
            onChangeText={setManualTag}
            placeholder="OFC-MBP-519"
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900"
          />
          <PrimaryButton
            title="Lookup / Assign Asset Tag"
            onPress={() => handleBarcode(manualTag.trim() || 'OFC-MBP-519')}
          />
        </View>
      </View>
    </NativeBottomSheet>
  );
}
