import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Edit3,
  Laptop,
  Plus,
  QrCode,
  RotateCcw,
  Search,
  UserCheck,
  Wrench,
} from 'lucide-react';
import { FONT_SANS, getPalette } from '../../theme/colors';
import {
  ItAssetCategory,
  ItAssetItem,
  ItAssetStatus,
} from '@/lib/it-admin-portal-logic';
import { getItAdminStatusTone, itSharedStyles } from './ItAdminSharedStyles';

interface ItAdminAssetsTabProps {
  assets: ItAssetItem[];
  isDark: boolean;
  onOpenAddAsset: () => void;
  onOpenEditAsset: (asset: ItAssetItem) => void;
  onOpenAssignAsset: (asset: ItAssetItem) => void;
  onReturnAsset: (assetId: string) => void;
  onOpenRepairModal: (asset: ItAssetItem) => void;
  onOpenQrModal: (asset: ItAssetItem | null, mode: 'sticker' | 'scan') => void;
}

const STATUS_FILTERS: ('All' | ItAssetStatus)[] = [
  'All',
  'Available',
  'Assigned',
  'In Repair',
  'Retired',
];

const CATEGORY_FILTERS: ('All' | ItAssetCategory)[] = [
  'All',
  'Laptop',
  'Monitor',
  'Smartphone',
  'Access Card',
  'Biometric Terminal',
  'Software License',
];

export function ItAdminAssetsTab({
  assets,
  isDark,
  onOpenAddAsset,
  onOpenEditAsset,
  onOpenAssignAsset,
  onReturnAsset,
  onOpenRepairModal,
  onOpenQrModal,
}: ItAdminAssetsTabProps) {
  const palette = getPalette(isDark);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ItAssetStatus>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ItAssetCategory>('All');

  const filteredAssets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return assets.filter((a) => {
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (categoryFilter !== 'All' && a.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        a.assetTag.toLowerCase().includes(q) ||
        a.brandModel.toLowerCase().includes(q) ||
        a.serialNumber.toLowerCase().includes(q) ||
        (a.assignedToName || '').toLowerCase().includes(q)
      );
    });
  }, [assets, searchQuery, statusFilter, categoryFilter]);

  return (
    <View style={itSharedStyles.stack}>
      {/* Top Action Bar */}
      <View
        style={[
          itSharedStyles.cardCompact,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={itSharedStyles.cardHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={[itSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
              IT Asset Registry ({assets.length})
            </Text>
            <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
              Hardware, biometric terminals, badges &amp; software licenses
            </Text>
          </View>
        </View>

        <View style={styles.topBtnsRow}>
          <Pressable
            accessibilityLabel="Add New IT Asset"
            onPress={onOpenAddAsset}
            style={[itSharedStyles.primaryBtn, { flex: 1, backgroundColor: palette.primary }]}
          >
            <Plus size={15} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={itSharedStyles.primaryBtnText}>Add Asset</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Scan Asset QR Code"
            onPress={() => onOpenQrModal(null, 'scan')}
            style={[
              itSharedStyles.secondaryBtn,
              { flex: 1, backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <QrCode size={15} color={palette.primary} strokeWidth={2.2} />
            <Text style={[itSharedStyles.secondaryBtnText, { color: palette.textPrimary }]}>
              Scan QR
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.searchWrap,
            { backgroundColor: palette.inputBg, borderColor: palette.border },
          ]}
        >
          <Search size={15} color={palette.textMuted} />
          <TextInput
            accessibilityLabel="Search IT Assets"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tag, model, serial, or assignee..."
            placeholderTextColor={palette.textMuted}
            style={[styles.searchInput, { color: palette.textPrimary }]}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {STATUS_FILTERS.map((st) => {
            const active = statusFilter === st;
            return (
              <Pressable
                key={st}
                accessibilityLabel={`Filter Status ${st}`}
                onPress={() => setStatusFilter(st)}
                style={[
                  itSharedStyles.filterChip,
                  {
                    backgroundColor: active ? palette.primaryLight : palette.inputBg,
                    borderColor: active ? palette.primary : palette.border,
                  },
                ]}
              >
                <Text
                  style={[
                    itSharedStyles.filterChipText,
                    { color: active ? palette.primary : palette.textSecondary },
                  ]}
                >
                  {st}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.filterScroll, { marginTop: 8 }]}
        >
          {CATEGORY_FILTERS.map((cat) => {
            const active = categoryFilter === cat;
            return (
              <Pressable
                key={cat}
                accessibilityLabel={`Filter Category ${cat}`}
                onPress={() => setCategoryFilter(cat)}
                style={[
                  itSharedStyles.filterChip,
                  {
                    backgroundColor: active ? palette.secondaryCta : palette.inputBg,
                    borderColor: active ? palette.secondaryCta : palette.border,
                  },
                ]}
              >
                <Text
                  style={[
                    itSharedStyles.filterChipText,
                    { color: active ? '#FFFFFF' : palette.textSecondary },
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Asset List */}
      {filteredAssets.length === 0 ? (
        <View
          style={[
            itSharedStyles.card,
            { backgroundColor: palette.surface, borderColor: palette.border, alignItems: 'center' },
          ]}
        >
          <Laptop size={24} color={palette.textMuted} />
          <Text style={[itSharedStyles.subTitle, { color: palette.textPrimary, marginTop: 8 }]}>
            No matching assets found
          </Text>
          <Text style={[itSharedStyles.metaText, { color: palette.textMuted, marginTop: 2 }]}>
            Adjust filters or register a new hardware item.
          </Text>
        </View>
      ) : (
        filteredAssets.map((asset) => {
          const tone = getItAdminStatusTone(asset.status, palette);
          return (
            <View
              key={asset.id}
              style={[
                itSharedStyles.cardCompact,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <View style={styles.assetHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.assetTitle, { color: palette.textPrimary }]}>
                    {asset.brandModel}
                  </Text>
                  <Text
                    style={[
                      itSharedStyles.metaText,
                      itSharedStyles.monoText,
                      { color: palette.textMuted },
                    ]}
                  >
                    {asset.assetTag} · {asset.category} · SN {asset.serialNumber}
                  </Text>
                </View>
                <View style={[itSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                  <Text style={[itSharedStyles.statusBadgeText, { color: tone.text }]}>
                    {asset.status}
                  </Text>
                </View>
              </View>

              <Text style={[itSharedStyles.metaText, { color: palette.textSecondary, marginTop: 6 }]}>
                {asset.assignedToName
                  ? `Assigned to ${asset.assignedToName} (${asset.assignedToEmployeeId}) · ${asset.assignedDepartment}`
                  : `Location: ${asset.location}`}
              </Text>
              <Text
                style={[
                  itSharedStyles.metaText,
                  itSharedStyles.monoText,
                  { color: palette.textMuted, marginTop: 2 },
                ]}
              >
                Condition: {asset.condition} · Warranty: {asset.warrantyExpiry}
              </Text>

              {asset.repairLogs.length > 0 ? (
                <View
                  style={[
                    styles.repairNotice,
                    { backgroundColor: palette.amberBg, borderColor: palette.amber },
                  ]}
                >
                  <Text style={[itSharedStyles.metaText, { color: palette.amber, fontWeight: '600' }]}>
                    Repair Log ({asset.repairLogs[0].repairStatus}): {asset.repairLogs[0].issueSummary} ·{' '}
                    {asset.repairLogs[0].vendor} (₹{asset.repairLogs[0].costInr})
                  </Text>
                </View>
              ) : null}

              <View style={styles.actionsWrap}>
                {asset.status === 'Available' ? (
                  <Pressable
                    accessibilityLabel={`Assign Asset ${asset.assetTag}`}
                    onPress={() => onOpenAssignAsset(asset)}
                    style={[styles.miniBtn, { backgroundColor: palette.primaryLight }]}
                  >
                    <UserCheck size={13} color={palette.primary} />
                    <Text style={[styles.miniBtnText, { color: palette.primary }]}>Assign</Text>
                  </Pressable>
                ) : asset.status === 'Assigned' ? (
                  <Pressable
                    accessibilityLabel={`Return Asset ${asset.assetTag}`}
                    onPress={() => onReturnAsset(asset.id)}
                    style={[styles.miniBtn, { backgroundColor: palette.skyBg }]}
                  >
                    <RotateCcw size={13} color={palette.sky} />
                    <Text style={[styles.miniBtnText, { color: palette.sky }]}>Return</Text>
                  </Pressable>
                ) : null}

                <Pressable
                  accessibilityLabel={`QR Sticker ${asset.assetTag}`}
                  onPress={() => onOpenQrModal(asset, 'sticker')}
                  style={[styles.miniBtn, { backgroundColor: palette.inputBg }]}
                >
                  <QrCode size={13} color={palette.textPrimary} />
                  <Text style={[styles.miniBtnText, { color: palette.textPrimary }]}>QR</Text>
                </Pressable>

                <Pressable
                  accessibilityLabel={`Repair Asset ${asset.assetTag}`}
                  onPress={() => onOpenRepairModal(asset)}
                  style={[styles.miniBtn, { backgroundColor: palette.amberBg }]}
                >
                  <Wrench size={13} color={palette.amber} />
                  <Text style={[styles.miniBtnText, { color: palette.amber }]}>
                    {asset.status === 'In Repair' ? 'Update Repair' : 'Repair'}
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityLabel={`Edit Asset ${asset.assetTag}`}
                  onPress={() => onOpenEditAsset(asset)}
                  style={[styles.miniBtn, { backgroundColor: palette.inputBg }]}
                >
                  <Edit3 size={13} color={palette.textSecondary} />
                  <Text style={[styles.miniBtnText, { color: palette.textSecondary }]}>Edit</Text>
                </Pressable>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topBtnsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  searchWrap: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT_SANS,
    fontSize: 13,
    paddingVertical: 8,
  },
  filterScroll: {
    gap: 8,
    paddingRight: 8,
  },
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  assetTitle: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '700',
  },
  repairNotice: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  actionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  miniBtn: {
    minHeight: 36,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  miniBtnText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '700',
  },
});
