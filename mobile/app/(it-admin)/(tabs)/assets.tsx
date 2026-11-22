import React, { useRef, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { QrCode } from 'lucide-react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { NativeCard, PrimaryButton, StatusPill } from '@/components/ui/NativeCard';
import { AssetQrScannerSheet } from '@/components/native/AssetQrScannerSheet';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';

export default function ItAdminAssetsScreen() {
  const { data, isRefreshing, onRefresh } = useDashboardData(hrmsService.fetchItAdminDashboard);
  const qrSheetRef = useRef<BottomSheetModal>(null);
  const [highlightedTag, setHighlightedTag] = useState<string | null>(null);

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader roleBadge="ASSETS" onOpenQuickActions={() => qrSheetRef.current?.present()} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <PrimaryButton
          title="Scan Hardware QR Sticker"
          icon={<QrCode size={16} color="#FFFFFF" />}
          onPress={() => qrSheetRef.current?.present()}
        />

        {highlightedTag ? (
          <View className="px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-200">
            <Text className="text-xs font-bold text-indigo-800">
              Matched Scanned Tag: {highlightedTag}
            </Text>
          </View>
        ) : null}

        {data?.assets.map((asset) => (
          <NativeCard
            key={asset.id}
            className={highlightedTag === asset.assetTag ? 'border-indigo-500' : ''}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-900">{asset.model}</Text>
                <Text className="text-xs text-slate-500">
                  {asset.assetTag} · S/N {asset.serialNumber}
                </Text>
                <Text className="text-[11px] text-slate-400 mt-1">
                  {asset.assignedTo ? `Assigned to ${asset.assignedTo}` : 'Unassigned'}
                </Text>
              </View>
              <StatusPill
                label={asset.status}
                tone={
                  asset.status === 'Assigned'
                    ? 'emerald'
                    : asset.status === 'Available'
                      ? 'indigo'
                      : 'amber'
                }
              />
            </View>
          </NativeCard>
        ))}
      </ScrollView>

      <AssetQrScannerSheet
        sheetRef={qrSheetRef}
        onScannedTag={(tag) => setHighlightedTag(tag)}
      />
    </View>
  );
}
