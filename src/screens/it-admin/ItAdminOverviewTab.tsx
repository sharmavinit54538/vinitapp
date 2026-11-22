import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Laptop,
  LifeBuoy,
  PackageCheck,
  QrCode,
  ShieldCheck,
  UserPlus,
  Wrench,
} from 'lucide-react';
import { FONT_MONO, FONT_SANS, getPalette } from '../../theme/colors';
import {
  ItAdminBottomTab,
  ItAdminHomeSubTab,
  ItAdminMoreModuleId,
  ItAdminPortalState,
  computeItAdminDashboardKpis,
} from '@/lib/it-admin-portal-logic';
import { getItAdminStatusTone, itSharedStyles } from './ItAdminSharedStyles';

interface ItAdminOverviewTabProps {
  state: ItAdminPortalState;
  isDark: boolean;
  onSelectHomeTab: (tab: ItAdminHomeSubTab) => void;
  onNavigateBottom: (tab: ItAdminBottomTab) => void;
  onOpenMoreModule: (mod: ItAdminMoreModuleId) => void;
  onOpenAssignOrScan: () => void;
  onOpenProvisionModal: () => void;
  onAssignTicketToMe: (ticketId: string) => void;
  onResolveTicketQuick: (ticketId: string) => void;
  onConfirmAssetReturnedQuick: (clearanceId: string, assetId: string) => void;
}

export function ItAdminOverviewTab({
  state,
  isDark,
  onSelectHomeTab,
  onNavigateBottom,
  onOpenMoreModule,
  onOpenAssignOrScan,
  onOpenProvisionModal,
  onAssignTicketToMe,
  onResolveTicketQuick,
  onConfirmAssetReturnedQuick,
}: ItAdminOverviewTabProps) {
  const palette = getPalette(isDark);
  const kpis = computeItAdminDashboardKpis(state);

  const urgentTickets = state.tickets
    .filter((t) => t.status !== 'Resolved')
    .slice(0, 2);

  const pendingClearances = state.offboardingClearances.filter(
    (c) => c.clearanceStatus === 'Pending IT Clearance'
  );

  const repairOrExpiringAssets = state.assets
    .filter(
      (a) =>
        a.status === 'In Repair' ||
        a.warrantyExpiry <= '2026-12-31' ||
        a.category === 'Software License'
    )
    .slice(0, 3);

  return (
    <View style={styles.stack}>
      {/* 1. 2x2 KPI Summary Cards */}
      <View style={styles.kpiGrid}>
        <Pressable
          accessibilityLabel="Total IT Assets KPI Card"
          onPress={() => onNavigateBottom('assets')}
          style={[
            styles.kpiCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>
              Total IT Assets
            </Text>
            <Laptop size={16} color={palette.primary} strokeWidth={2.2} />
          </View>
          <Text style={[styles.kpiVal, { color: palette.textPrimary }]}>
            {kpis.totalActiveAssets}
          </Text>
          <Text style={[styles.kpiSub, { color: palette.textSecondary }]}>
            {kpis.assignedAssetsCount} Assigned / {kpis.availableAssetsCount} Available
          </Text>
          <View style={styles.kpiFooterRow}>
            <Text style={[styles.kpiMeta, { color: palette.primary }]}>
              View inventory
            </Text>
            <ChevronRight size={13} color={palette.primary} />
          </View>
        </Pressable>

        <Pressable
          accessibilityLabel="Open IT Tickets KPI Card"
          onPress={() => onNavigateBottom('tickets')}
          style={[
            styles.kpiCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>
              Open IT Tickets
            </Text>
            <LifeBuoy size={16} color={palette.amber} strokeWidth={2.2} />
          </View>
          <Text style={[styles.kpiVal, { color: palette.amber }]}>
            {kpis.openTicketsCount}
          </Text>
          <Text style={[styles.kpiSub, { color: palette.rose }]}>
            {kpis.highCriticalTicketsCount} High/Critical SLA
          </Text>
          <View style={styles.kpiFooterRow}>
            <Text style={[styles.kpiMeta, { color: palette.primary }]}>
              Review queue
            </Text>
            <ChevronRight size={13} color={palette.primary} />
          </View>
        </Pressable>

        <Pressable
          accessibilityLabel="Pending IT Clearances KPI Card"
          onPress={() => onOpenMoreModule('offboarding')}
          style={[
            styles.kpiCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.kpiTopRow}>
            <Text numberOfLines={1} style={[styles.kpiLabel, { color: palette.textMuted }]}>
              IT Clearances
            </Text>
            <PackageCheck size={16} color={palette.violet} strokeWidth={2.2} />
          </View>
          <Text style={[styles.kpiVal, { color: palette.textPrimary }]}>
            {kpis.pendingClearancesCount}
          </Text>
          <Text style={[styles.kpiSub, { color: palette.textSecondary }]}>
            {kpis.pendingJoinersCount} Joiners · {kpis.pendingExitsCount} Exits
          </Text>
          <View style={styles.kpiFooterRow}>
            <Text style={[styles.kpiMeta, { color: palette.primary }]}>
              Open tracker
            </Text>
            <ChevronRight size={13} color={palette.primary} />
          </View>
        </Pressable>

        <Pressable
          accessibilityLabel="System and Security Health KPI Card"
          onPress={() => onOpenMoreModule('audit_logs')}
          style={[
            styles.kpiCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>
              System &amp; Security
            </Text>
            <ShieldCheck size={16} color={palette.emerald} strokeWidth={2.2} />
          </View>
          <Text style={[styles.kpiVal, { color: palette.emerald }]}>
            {kpis.mfaAdoptionPct}%
          </Text>
          <Text style={[styles.kpiSub, { color: palette.textSecondary }]}>
            {kpis.activeUsersCount} Active · 2FA Rate
          </Text>
          <View style={styles.kpiFooterRow}>
            <Text style={[styles.kpiMeta, { color: palette.textMuted }]}>
              View logs
            </Text>
            <ChevronRight size={13} color={palette.textMuted} />
          </View>
        </Pressable>
      </View>

      {/* 2. Quick IT Actions (2x2 Grid Card) */}
      <View
        style={[
          itSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Text style={[itSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
          Quick IT Actions
        </Text>
        <View style={styles.quickGrid}>
          <Pressable
            accessibilityLabel="Quick Action Assign or Scan Asset"
            onPress={onOpenAssignOrScan}
            style={[
              styles.quickBtn,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <QrCode size={18} color={palette.primary} strokeWidth={2.2} />
            <Text style={[styles.quickBtnTitle, { color: palette.textPrimary }]}>
              Assign / Scan Asset
            </Text>
            <Text style={[styles.quickBtnSub, { color: palette.textMuted }]}>
              Issue hardware or scan QR
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Quick Action IT Helpdesk Queue"
            onPress={() => onNavigateBottom('tickets')}
            style={[
              styles.quickBtn,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <LifeBuoy size={18} color={palette.amber} strokeWidth={2.2} />
            <Text style={[styles.quickBtnTitle, { color: palette.textPrimary }]}>
              IT Helpdesk Queue
            </Text>
            <Text style={[styles.quickBtnSub, { color: palette.textMuted }]}>
              Resolve employee tech tickets
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Quick Action Provision Access"
            onPress={onOpenProvisionModal}
            style={[
              styles.quickBtn,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <UserPlus size={18} color={palette.emerald} strokeWidth={2.2} />
            <Text style={[styles.quickBtnTitle, { color: palette.textPrimary }]}>
              Provision Access
            </Text>
            <Text style={[styles.quickBtnSub, { color: palette.textMuted }]}>
              Create emails, roles &amp; RBAC
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Quick Action Exit Asset Recovery"
            onPress={() => onOpenMoreModule('offboarding')}
            style={[
              styles.quickBtn,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <PackageCheck size={18} color={palette.rose} strokeWidth={2.2} />
            <Text style={[styles.quickBtnTitle, { color: palette.textPrimary }]}>
              Exit Asset Recovery
            </Text>
            <Text style={[styles.quickBtnSub, { color: palette.textMuted }]}>
              Revoke access &amp; collect devices
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 3. Urgent Tickets & IT Clearance Widget */}
      <View
        style={[
          itSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={itSharedStyles.cardHeaderRow}>
          <Text style={[itSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
            Urgent Tickets &amp; Clearances
          </Text>
          <Pressable
            accessibilityLabel="Open Urgent Tickets Center"
            onPress={() => onNavigateBottom('tickets')}
          >
            <Text style={[itSharedStyles.linkText, { color: palette.primary }]}>
              Open Center
            </Text>
          </Pressable>
        </View>

        {urgentTickets.length === 0 && pendingClearances.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
              Zero urgent IT tickets or pending device recoveries.
            </Text>
          </View>
        ) : (
          <>
            {urgentTickets.map((t, idx) => {
              const pTone = getItAdminStatusTone(t.priority, palette);
              const isAssignedToMe = t.assignedToId === state.profile.itAdminId;
              return (
                <View
                  key={t.id}
                  style={[
                    itSharedStyles.listRow,
                    idx > 0
                      ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                      : null,
                  ]}
                >
                  <View style={styles.itemTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.listName, { color: palette.textPrimary }]}>
                        {t.subject}
                      </Text>
                      <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
                        {t.ticketNumber} · {t.employeeName} ({t.department}) · {t.slaTargetLabel}
                      </Text>
                    </View>
                    <View style={[itSharedStyles.statusBadge, { backgroundColor: pTone.bg }]}>
                      <Text style={[itSharedStyles.statusBadgeText, { color: pTone.text }]}>
                        {t.priority}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    {!isAssignedToMe ? (
                      <Pressable
                        accessibilityLabel={`Assign ${t.ticketNumber} to Me`}
                        onPress={() => onAssignTicketToMe(t.id)}
                        style={[
                          styles.inlineActionBtn,
                          { backgroundColor: palette.primaryLight },
                        ]}
                      >
                        <Text style={[styles.inlineBtnText, { color: palette.primary }]}>
                          Assign to Me
                        </Text>
                      </Pressable>
                    ) : null}
                    <Pressable
                      accessibilityLabel={`Mark Resolved ${t.ticketNumber}`}
                      onPress={() => onResolveTicketQuick(t.id)}
                      style={[
                        styles.inlineActionBtn,
                        { backgroundColor: palette.emeraldBg },
                      ]}
                    >
                      <CheckCircle2 size={14} color={palette.emerald} strokeWidth={2.4} />
                      <Text style={[styles.inlineBtnText, { color: palette.emerald }]}>
                        Mark Resolved
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}

            {pendingClearances.slice(0, 1).map((clr) => {
              const pendingAssetId = clr.assignedAssetIds.find(
                (id) => !clr.returnedAssetIds.includes(id)
              );
              const pendingAssetLabel = pendingAssetId
                ? clr.assignedAssetLabels[clr.assignedAssetIds.indexOf(pendingAssetId)]
                : null;
              return (
                <View
                  key={clr.id}
                  style={[
                    itSharedStyles.listRow,
                    { borderTopWidth: 1, borderTopColor: palette.borderSubtle },
                  ]}
                >
                  <View style={styles.itemTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.listName, { color: palette.textPrimary }]}>
                        Offboarding Recovery · {clr.fullName}
                      </Text>
                      <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
                        LWD {clr.lastWorkingDay} · {clr.returnedAssetIds.length}/
                        {clr.assignedAssetIds.length} devices returned
                      </Text>
                    </View>
                    <View
                      style={[
                        itSharedStyles.statusBadge,
                        { backgroundColor: palette.amberBg },
                      ]}
                    >
                      <Text style={[itSharedStyles.statusBadgeText, { color: palette.amber }]}>
                        Clearance Due
                      </Text>
                    </View>
                  </View>
                  <View style={styles.actionRow}>
                    {pendingAssetId ? (
                      <Pressable
                        accessibilityLabel={`Confirm Asset Returned ${pendingAssetId}`}
                        onPress={() => onConfirmAssetReturnedQuick(clr.id, pendingAssetId)}
                        style={[
                          styles.inlineActionBtn,
                          { backgroundColor: palette.skyBg },
                        ]}
                      >
                        <PackageCheck size={14} color={palette.sky} strokeWidth={2.3} />
                        <Text style={[styles.inlineBtnText, { color: palette.sky }]}>
                          Confirm {pendingAssetLabel?.split('(')[0]?.trim() || 'Device'} Returned
                        </Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        accessibilityLabel="Complete IT Clearance Sign-Off"
                        onPress={() => onOpenMoreModule('offboarding')}
                        style={[
                          styles.inlineActionBtn,
                          { backgroundColor: palette.emeraldBg },
                        ]}
                      >
                        <Text style={[styles.inlineBtnText, { color: palette.emerald }]}>
                          Complete IT Sign-Off
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}
      </View>

      {/* 4. Asset Lifecycle, License Alerts & Recent Audit Widget */}
      <View
        style={[
          itSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={itSharedStyles.cardHeaderRow}>
          <Text style={[itSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
            Asset Lifecycle &amp; Security Alerts
          </Text>
          <Pressable
            accessibilityLabel="Open Assets Lifecycle View"
            onPress={() => onSelectHomeTab('assets')}
          >
            <Text style={[itSharedStyles.linkText, { color: palette.primary }]}>
              Inspect All
            </Text>
          </Pressable>
        </View>

        {repairOrExpiringAssets.map((asset, idx) => {
          const sTone = getItAdminStatusTone(asset.status, palette);
          return (
            <View
              key={asset.id}
              style={[
                itSharedStyles.listRow,
                idx > 0
                  ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                  : null,
              ]}
            >
              <View style={styles.itemTopRow}>
                <View style={[styles.iconTile, { backgroundColor: palette.inputBg }]}>
                  {asset.status === 'In Repair' ? (
                    <Wrench size={16} color={palette.rose} />
                  ) : (
                    <AlertTriangle size={16} color={palette.amber} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.listName, { color: palette.textPrimary }]}>
                    {asset.brandModel}
                  </Text>
                  <Text
                    style={[
                      itSharedStyles.metaText,
                      itSharedStyles.monoText,
                      { color: palette.textMuted },
                    ]}
                  >
                    {asset.assetTag} · Exp {asset.warrantyExpiry}
                  </Text>
                </View>
                <View style={[itSharedStyles.statusBadge, { backgroundColor: sTone.bg }]}>
                  <Text style={[itSharedStyles.statusBadgeText, { color: sTone.text }]}>
                    {asset.status}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        {state.auditLogs.slice(0, 2).map((log) => (
          <View
            key={log.id}
            style={[
              itSharedStyles.listRow,
              { borderTopWidth: 1, borderTopColor: palette.borderSubtle },
            ]}
          >
            <Text style={[styles.listName, { color: palette.textPrimary }]}>
              {log.action}
            </Text>
            <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
              {log.category} · {log.target} · {log.timestamp}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 14 },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 4,
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  kpiLabel: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  kpiVal: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.6,
    marginTop: 2,
  },
  kpiSub: {
    fontFamily: FONT_SANS,
    fontSize: 11,
    fontWeight: '500',
  },
  kpiFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  kpiMeta: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  quickBtn: {
    width: '48%',
    flexGrow: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 3,
  },
  quickBtnTitle: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  quickBtnSub: {
    fontFamily: FONT_SANS,
    fontSize: 11,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listName: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  inlineActionBtn: {
    flex: 1,
    minHeight: 38,
    borderRadius: 12,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  inlineBtnText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    paddingVertical: 14,
    alignItems: 'center',
  },
});
