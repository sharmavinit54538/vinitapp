import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar, Check, Clock, Users, X } from 'lucide-react';
import { FONT_MONO, FONT_SANS, getPalette } from '../../theme/colors';
import {
  ApprovalFilterCategory,
  ManagerApprovalItem,
  filterManagerApprovals,
} from '@/lib/manager-portal-logic';
import { getManagerStatusTone, mgrSharedStyles } from './ManagerSharedStyles';

interface ManagerApprovalsTabProps {
  approvals: ManagerApprovalItem[];
  managerId: string;
  isDark: boolean;
  onApproveItem: (approvalId: string) => void;
  onOpenRejectModal: (approvalId: string) => void;
}

const FILTER_TABS: ApprovalFilterCategory[] = [
  'All',
  'Leaves',
  'Shift Swaps',
  'Expenses & Travel',
  'Timesheets',
];

export function ManagerApprovalsTab({
  approvals,
  managerId,
  isDark,
  onApproveItem,
  onOpenRejectModal,
}: ManagerApprovalsTabProps) {
  const palette = getPalette(isDark);
  const [categoryFilter, setCategoryFilter] =
    useState<ApprovalFilterCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'Pending' | 'All'>('Pending');

  const categoryItems = filterManagerApprovals(approvals, managerId, categoryFilter);
  const visibleItems =
    statusFilter === 'Pending'
      ? categoryItems.filter((i) => i.status === 'Pending')
      : categoryItems;

  const pendingCount = filterManagerApprovals(approvals, managerId, 'All').filter(
    (a) => a.status === 'Pending'
  ).length;

  return (
    <View style={mgrSharedStyles.stack}>
      {/* Header Summary Card */}
      <View
        style={[
          mgrSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={mgrSharedStyles.cardHeaderRow}>
          <View>
            <Text style={[mgrSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
              Unified Team Approval Center
            </Text>
            <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
              {pendingCount} pending across leaves, shifts, expenses &amp; timesheets
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {(['Pending', 'All'] as const).map((st) => {
              const active = statusFilter === st;
              return (
                <Pressable
                  key={st}
                  accessibilityLabel={`Show ${st} Approvals`}
                  onPress={() => setStatusFilter(st)}
                  style={[
                    mgrSharedStyles.filterChip,
                    {
                      backgroundColor: active ? palette.primaryLight : palette.inputBg,
                      borderColor: active ? palette.primary : palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      mgrSharedStyles.filterChipText,
                      { color: active ? palette.primary : palette.textSecondary },
                    ]}
                  >
                    {st}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={mgrSharedStyles.chipRow}>
          {FILTER_TABS.map((cat) => {
            const active = categoryFilter === cat;
            return (
              <Pressable
                key={cat}
                accessibilityLabel={`Filter Approvals ${cat}`}
                onPress={() => setCategoryFilter(cat)}
                style={[
                  mgrSharedStyles.filterChip,
                  {
                    backgroundColor: active ? palette.primaryLight : palette.inputBg,
                    borderColor: active ? palette.primary : palette.border,
                  },
                ]}
              >
                <Text
                  style={[
                    mgrSharedStyles.filterChipText,
                    { color: active ? palette.primary : palette.textSecondary },
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Request Cards */}
      {visibleItems.length === 0 ? (
        <View
          style={[
            mgrSharedStyles.card,
            { backgroundColor: palette.surface, borderColor: palette.border, alignItems: 'center' },
          ]}
        >
          <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
            No Requests in {categoryFilter}
          </Text>
          <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted, marginTop: 4 }]}>
            Switch status to All or pick another category filter.
          </Text>
        </View>
      ) : (
        visibleItems.map((item) => {
          const tone = getManagerStatusTone(item.status, palette);
          return (
            <View
              key={item.id}
              style={[
                mgrSharedStyles.card,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <View style={styles.cardTopRow}>
                <View style={[styles.avatarBox, { backgroundColor: palette.primaryLight }]}>
                  <Text style={[styles.avatarText, { color: palette.primary }]}>
                    {item.initials}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    {item.employeeName} · {item.requestTitle}
                  </Text>
                  <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                    {item.designation} · {item.category} · {item.submittedAt}
                  </Text>
                </View>
                <View style={[mgrSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                  <Text style={[mgrSharedStyles.statusBadgeText, { color: tone.text }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.contextBox,
                  { backgroundColor: palette.inputBg, borderColor: palette.borderSubtle },
                ]}
              >
                <View style={styles.contextRow}>
                  <Calendar size={14} color={palette.primary} />
                  <Text
                    style={[
                      mgrSharedStyles.metaText,
                      mgrSharedStyles.monoText,
                      { color: palette.textPrimary },
                    ]}
                  >
                    {item.dateRange} · {item.durationOrAmount}
                  </Text>
                </View>
                <Text style={[mgrSharedStyles.metaText, { color: palette.textSecondary }]}>
                  Reason: {item.reason}
                </Text>

                {item.leaveContext ? (
                  <View style={styles.leaveContextWrap}>
                    <View style={styles.contextRow}>
                      <Users size={13} color={palette.amber} />
                      <Text style={[mgrSharedStyles.metaText, { color: palette.textPrimary }]}>
                        Balance: <Text style={mgrSharedStyles.monoText}>{item.leaveContext.remainingDays}d</Text> {item.leaveContext.leaveType}
                      </Text>
                    </View>
                    <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                      Team Overlap:{' '}
                      {item.leaveContext.overlappingTeammates.length > 0
                        ? item.leaveContext.overlappingTeammates.join(', ')
                        : 'No overlapping team leaves'}
                    </Text>
                  </View>
                ) : null}

                {item.shiftSwapContext ? (
                  <View style={styles.contextRow}>
                    <Clock size={13} color={palette.primary} />
                    <Text style={[mgrSharedStyles.metaText, { color: palette.textPrimary }]}>
                      {item.shiftSwapContext.currentShift} → {item.shiftSwapContext.requestedShift}
                    </Text>
                  </View>
                ) : null}

                {item.rejectionRemark ? (
                  <Text style={[mgrSharedStyles.metaText, { color: palette.rose }]}>
                    Manager Remark: {item.rejectionRemark}
                  </Text>
                ) : null}
              </View>

              {item.status === 'Pending' ? (
                <View style={styles.btnRow}>
                  <Pressable
                    accessibilityLabel={`Approve Request ${item.id}`}
                    onPress={() => onApproveItem(item.id)}
                    style={[
                      mgrSharedStyles.primaryBtn,
                      { flex: 1, backgroundColor: palette.emerald },
                    ]}
                  >
                    <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={mgrSharedStyles.primaryBtnText}>Approve</Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel={`Reject Request ${item.id}`}
                    onPress={() => onOpenRejectModal(item.id)}
                    style={[
                      mgrSharedStyles.secondaryBtn,
                      {
                        flex: 1,
                        backgroundColor: palette.roseBg,
                        borderColor: palette.rose,
                      },
                    ]}
                  >
                    <X size={16} color={palette.rose} strokeWidth={2.5} />
                    <Text style={[mgrSharedStyles.secondaryBtnText, { color: palette.rose }]}>
                      Reject
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
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    fontWeight: '700',
  },
  contextBox: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  leaveContextWrap: {
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148,163,184,0.2)',
    gap: 3,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
});
