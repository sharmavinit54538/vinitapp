import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, PauseCircle, ShieldCheck } from 'lucide-react';
import { FONT_SANS, getPalette } from '../../theme/colors';
import {
  ExecutiveApprovalCategory,
  ExecutiveApprovalItem,
  ExecutiveApprovalStatus,
  ExecutivePortalState,
} from '@/lib/executive-portal-logic';
import { execSharedStyles, getExecutiveStatusTone } from './ExecutiveSharedStyles';

interface ExecutiveApprovalsTabProps {
  state: ExecutivePortalState;
  isDark: boolean;
  onApproveItem: (approvalId: string) => void;
  onHoldItem: (item: ExecutiveApprovalItem) => void;
}

const STATUS_FILTERS: ('All' | ExecutiveApprovalStatus)[] = [
  'All',
  'Pending',
  'Approved',
  'On Hold',
];

const CATEGORY_FILTERS: ('All' | ExecutiveApprovalCategory)[] = [
  'All',
  'Payroll Batch',
  'Senior Offer',
  'Budget & Expense',
  'Compliance & Exit',
];

export function ExecutiveApprovalsTab({
  state,
  isDark,
  onApproveItem,
  onHoldItem,
}: ExecutiveApprovalsTabProps) {
  const palette = getPalette(isDark);
  const [statusFilter, setStatusFilter] = useState<'All' | ExecutiveApprovalStatus>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ExecutiveApprovalCategory>('All');

  const filtered = useMemo(() => {
    return state.approvals.filter((a) => {
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (categoryFilter !== 'All' && a.category !== categoryFilter) return false;
      return true;
    });
  }, [state.approvals, statusFilter, categoryFilter]);

  const pendingCount = state.approvals.filter((a) => a.status === 'Pending').length;
  const payrollTone = getExecutiveStatusTone(state.payrollCycle.status, palette);

  return (
    <View style={execSharedStyles.stack}>
      {/* Maker-Checker Payroll Sign-Off Banner */}
      <View
        style={[
          execSharedStyles.cardCompact,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={execSharedStyles.cardHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <ShieldCheck size={18} color={palette.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[execSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
                Executive Governance Queue ({pendingCount} Pending)
              </Text>
              <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
                Maker-Checker Payroll Release, Senior Offers &amp; Escalations
              </Text>
            </View>
          </View>
          <View style={[execSharedStyles.statusBadge, { backgroundColor: payrollTone.bg }]}>
            <Text style={[execSharedStyles.statusBadgeText, { color: payrollTone.text }]}>
              {state.payrollCycle.status}
            </Text>
          </View>
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
                accessibilityLabel={`Approval Status Filter ${st}`}
                onPress={() => setStatusFilter(st)}
                style={[
                  execSharedStyles.filterChip,
                  {
                    backgroundColor: active ? palette.primaryLight : palette.inputBg,
                    borderColor: active ? palette.primary : palette.border,
                  },
                ]}
              >
                <Text
                  style={[
                    execSharedStyles.filterChipText,
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
                accessibilityLabel={`Approval Category Filter ${cat}`}
                onPress={() => setCategoryFilter(cat)}
                style={[
                  execSharedStyles.filterChip,
                  {
                    backgroundColor: active ? palette.secondaryCta : palette.inputBg,
                    borderColor: active ? palette.secondaryCta : palette.border,
                  },
                ]}
              >
                <Text
                  style={[
                    execSharedStyles.filterChipText,
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

      {filtered.length === 0 ? (
        <View
          style={[
            execSharedStyles.card,
            { backgroundColor: palette.surface, borderColor: palette.border, alignItems: 'center' },
          ]}
        >
          <Text style={[execSharedStyles.subTitle, { color: palette.textPrimary }]}>
            No items match current filters
          </Text>
          <Text style={[execSharedStyles.metaText, { color: palette.textMuted, marginTop: 2 }]}>
            Switch status or category filters to inspect all sign-offs.
          </Text>
        </View>
      ) : (
        filtered.map((item) => {
          const sTone = getExecutiveStatusTone(item.status, palette);
          const pTone = getExecutiveStatusTone(item.priority, palette);
          return (
            <View
              key={item.id}
              style={[
                execSharedStyles.cardCompact,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <View style={styles.itemHeader}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      execSharedStyles.metaText,
                      execSharedStyles.monoText,
                      { color: palette.primary, fontWeight: '700' },
                    ]}
                  >
                    {item.referenceCode} · {item.category}
                  </Text>
                  <Text style={[styles.itemTitle, { color: palette.textPrimary }]}>
                    {item.title}
                  </Text>
                </View>
                <View style={[execSharedStyles.statusBadge, { backgroundColor: sTone.bg }]}>
                  <Text style={[execSharedStyles.statusBadgeText, { color: sTone.text }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text style={[execSharedStyles.metaText, { color: palette.textMuted, marginTop: 4 }]}>
                {item.requestedBy} · {item.department}
              </Text>
              <Text
                style={[
                  execSharedStyles.metaText,
                  execSharedStyles.monoText,
                  { color: palette.textPrimary, fontWeight: '700', marginTop: 2 },
                ]}
              >
                Impact: {item.amountLabel} ·{' '}
                <Text style={{ color: pTone.text }}>{item.priority} Priority</Text>
              </Text>

              <Text style={[execSharedStyles.metaText, { color: palette.textSecondary, marginTop: 8 }]}>
                {item.rationale}
              </Text>

              {item.decisionNote ? (
                <View
                  style={[
                    styles.noteBox,
                    { backgroundColor: palette.inputBg, borderColor: palette.border },
                  ]}
                >
                  <Text style={[execSharedStyles.metaText, { color: palette.textSecondary }]}>
                    Executive Note ({item.decidedAt || 'Updated'}): {item.decisionNote}
                  </Text>
                </View>
              ) : null}

              {item.status === 'Pending' ? (
                <View style={styles.actionsRow}>
                  <Pressable
                    accessibilityLabel={`Sign Off Approve ${item.referenceCode}`}
                    onPress={() => onApproveItem(item.id)}
                    style={[styles.btnHalf, { backgroundColor: palette.emeraldBg }]}
                  >
                    <CheckCircle2 size={15} color={palette.emerald} strokeWidth={2.4} />
                    <Text style={[styles.btnText, { color: palette.emerald }]}>
                      Approve &amp; Sign Off
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel={`Sign Off Hold ${item.referenceCode}`}
                    onPress={() => onHoldItem(item)}
                    style={[styles.btnHalf, { backgroundColor: palette.amberBg }]}
                  >
                    <PauseCircle size={15} color={palette.amber} strokeWidth={2.3} />
                    <Text style={[styles.btnText, { color: palette.amber }]}>
                      Place on Hold
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filterScroll: {
    gap: 8,
    paddingRight: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  itemTitle: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  noteBox: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  btnHalf: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '700',
  },
});
