import React, { useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Laptop, LifeBuoy, QrCode, ShieldAlert, ShieldCheck, UserPlus } from 'lucide-react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { KpiTile, NativeCard, SectionHeader, StatusPill } from '@/components/ui/NativeCard';
import { DashboardSkeleton } from '@/components/ui/SkeletonCard';
import { AssetQrScannerSheet } from '@/components/native/AssetQrScannerSheet';
import { NotificationsSheet } from '@/components/native/NotificationsSheet';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';
import { triggerHaptic } from '@/services/nativeModules';

export default function ItAdminHomeScreen() {
  const router = useRouter();
  const { data, isLoading, isRefreshing, onRefresh } = useDashboardData(
    hrmsService.fetchItAdminDashboard
  );
  const qrSheetRef = useRef<BottomSheetModal>(null);
  const notifSheetRef = useRef<BottomSheetModal>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader
        roleBadge="IT ADMIN"
        onOpenQuickActions={() => qrSheetRef.current?.present()}
        onOpenNotifications={() => notifSheetRef.current?.present()}
      />

      {scannedResult ? (
        <View className="mx-4 mt-3 px-4 py-3 rounded-xl bg-slate-900">
          <Text className="text-xs font-bold text-emerald-400">QR Scanned: {scannedResult}</Text>
        </View>
      ) : null}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {isLoading || !data ? (
          <DashboardSkeleton />
        ) : (
          <>
            <View className="flex-row flex-wrap gap-3">
              <KpiTile
                label="Total IT Assets"
                value={String(data.kpis.totalAssets)}
                subtext={`${data.kpis.assignedAssets} Assigned`}
                linkText="Inventory"
                icon={<Laptop size={16} color="#4F46E5" />}
                onPress={() => router.push('/(it-admin)/(tabs)/assets')}
              />
              <KpiTile
                label="Open Tickets"
                value={String(data.kpis.openTickets)}
                subtext={`${data.kpis.criticalSla} Critical SLA`}
                linkText="SLA Queue"
                accent="rose"
                icon={<LifeBuoy size={16} color="#E11D48" />}
                onPress={() => router.push('/(it-admin)/(tabs)/tickets')}
              />
              <KpiTile
                label="IT Clearances"
                value={String(data.kpis.pendingClearances)}
                subtext="Exit & provisioning"
                linkText="Checklist"
                accent="amber"
                icon={<ShieldAlert size={16} color="#D97706" />}
                onPress={() => router.push('/(it-admin)/(tabs)/more')}
              />
              <KpiTile
                label="2FA / SSO Health"
                value={`${data.kpis.mfaAdoptionPct}%`}
                subtext="Active MFA adoption"
                linkText="RBAC"
                accent="emerald"
                icon={<ShieldCheck size={16} color="#10B981" />}
                onPress={() => router.push('/(it-admin)/(tabs)/users-rbac')}
              />
            </View>

            <NativeCard>
              <SectionHeader title="Quick IT Operations" />
              <View className="flex-row flex-wrap gap-2.5">
                <Pressable
                  onPress={() => {
                    void triggerHaptic('light');
                    qrSheetRef.current?.present();
                  }}
                  className="flex-1 min-w-[46%] bg-slate-50 border border-slate-200 rounded-xl p-3.5 gap-1.5"
                >
                  <QrCode size={18} color="#4F46E5" />
                  <Text className="text-xs font-bold text-slate-900">Scan Asset QR</Text>
                  <Text className="text-[11px] text-slate-500">Camera barcode lookup</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    void triggerHaptic('light');
                    router.push('/(it-admin)/(tabs)/users-rbac');
                  }}
                  className="flex-1 min-w-[46%] bg-slate-50 border border-slate-200 rounded-xl p-3.5 gap-1.5"
                >
                  <UserPlus size={18} color="#10B981" />
                  <Text className="text-xs font-bold text-slate-900">Provision User</Text>
                  <Text className="text-[11px] text-slate-500">Roles, SSO & 2FA</Text>
                </Pressable>
              </View>
            </NativeCard>

            <NativeCard>
              <SectionHeader
                title="Critical Helpdesk Queue"
                actionLabel="All Tickets"
                onAction={() => router.push('/(it-admin)/(tabs)/tickets')}
              />
              {data.tickets.map((t, idx) => (
                <View
                  key={t.id}
                  className={`py-2.5 flex-row items-center justify-between ${
                    idx > 0 ? 'border-t border-slate-100' : ''
                  }`}
                >
                  <View className="flex-1 pr-2">
                    <Text className="text-xs font-bold text-slate-900">{t.subject}</Text>
                    <Text className="text-[11px] text-slate-500">
                      {t.id} · {t.requester} · {t.slaRemaining}
                    </Text>
                  </View>
                  <StatusPill
                    label={t.priority}
                    tone={t.priority === 'Critical' ? 'rose' : 'amber'}
                  />
                </View>
              ))}
            </NativeCard>
          </>
        )}
      </ScrollView>

      <AssetQrScannerSheet
        sheetRef={qrSheetRef}
        onScannedTag={(tag) => setScannedResult(`${tag} verified in inventory`)}
      />
      <NotificationsSheet sheetRef={notifSheetRef} />
    </View>
  );
}
