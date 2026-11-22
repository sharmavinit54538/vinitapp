import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CalendarPlus, XCircle } from 'lucide-react';
import { FONT_MONO, FONT_SANS, getPalette } from '../../theme/colors';
import {
  EmployeeLeaveRequest,
  EmployeePortalState,
} from '@/lib/employee-portal-logic';
import { empSharedStyles, getStatusTone } from './EmployeeSharedStyles';

interface EmployeeLeavesTabProps {
  state: EmployeePortalState;
  isDark: boolean;
  onOpenApplyLeave: () => void;
  onCancelLeave: (leaveId: string) => void;
}

export function EmployeeLeavesTab({
  state,
  isDark,
  onOpenApplyLeave,
  onCancelLeave,
}: EmployeeLeavesTabProps) {
  const palette = getPalette(isDark);
  const [statusFilter, setStatusFilter] = useState<
    'All' | EmployeeLeaveRequest['status']
  >('All');

  const filteredLeaves = useMemo(() => {
    if (statusFilter === 'All') return state.leaveRequests;
    return state.leaveRequests.filter((l) => l.status === statusFilter);
  }, [state.leaveRequests, statusFilter]);

  return (
    <View style={empSharedStyles.stack}>
      {/* Apply Leave Action Header */}
      <View
        style={[
          empSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eyebrow, { color: palette.primary }]}>
              2026 Leave Entitlements
            </Text>
            <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
              Leave Balances &amp; Time Off
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Apply Leave Button"
            onPress={onOpenApplyLeave}
            style={[empSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
          >
            <CalendarPlus size={16} color="#FFFFFF" />
            <Text style={empSharedStyles.primaryBtnText}>Apply Leave</Text>
          </Pressable>
        </View>

        <View style={styles.balanceGrid}>
          {state.leaveBalances.map((bal) => (
            <View
              key={bal.key}
              style={[
                styles.balanceCard,
                { backgroundColor: palette.inputBg, borderColor: palette.border },
              ]}
            >
              <View style={styles.balTopRow}>
                <Text style={[styles.balCode, { color: palette.primary }]}>
                  {bal.code}
                </Text>
                <Text style={[empSharedStyles.metaText, empSharedStyles.monoText, { color: palette.textMuted }]}>
                  {bal.key === 'unpaid' ? `${bal.used} used` : `${bal.used}/${bal.total} used`}
                </Text>
              </View>
              <Text style={[styles.balNum, { color: palette.textPrimary }]}>
                {bal.key === 'unpaid' ? bal.used : bal.remaining}
              </Text>
              <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                {bal.label}
              </Text>
              <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                {bal.accrualNote}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Leave History & Pending Cancel */}
      <View
        style={[
          empSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary, marginBottom: 10 }]}>
          Leave History ({filteredLeaves.length})
        </Text>

        <View style={[empSharedStyles.chipRow, { marginBottom: 10 }]}>
          {(['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'] as const).map((st) => {
            const active = statusFilter === st;
            return (
              <Pressable
                key={st}
                onPress={() => setStatusFilter(st)}
                style={[
                  empSharedStyles.filterChip,
                  {
                    backgroundColor: active ? palette.primaryLight : palette.inputBg,
                    borderColor: active ? palette.primary : palette.border,
                  },
                ]}
              >
                <Text
                  style={[
                    empSharedStyles.filterChipText,
                    { color: active ? palette.primary : palette.textSecondary },
                  ]}
                >
                  {st}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {filteredLeaves.length === 0 ? (
          <Text style={[empSharedStyles.metaText, { color: palette.textMuted, paddingVertical: 18, textAlign: 'center' }]}>
            No leave requests match this status filter.
          </Text>
        ) : (
          filteredLeaves.map((lr, idx) => {
            const tone = getStatusTone(lr.status, palette);
            return (
              <View
                key={lr.id}
                style={[
                  empSharedStyles.listRow,
                  idx > 0
                    ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                    : null,
                ]}
              >
                <View style={styles.leaveRowTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                      {lr.leaveType} ·{' '}
                      <Text style={empSharedStyles.monoText}>
                        {lr.days} {lr.days === 1 ? 'day' : 'days'}
                      </Text>
                    </Text>
                    <Text style={[empSharedStyles.metaText, empSharedStyles.monoText, { color: palette.textMuted }]}>
                      {lr.fromDate} → {lr.toDate}
                      {lr.isHalfDay ? ' · Half Day' : ''}
                    </Text>
                    <Text style={[empSharedStyles.metaText, { color: palette.textSecondary, marginTop: 4 }]}>
                      {lr.reason}
                    </Text>
                  </View>
                  <View style={[empSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                    <Text style={[empSharedStyles.statusBadgeText, { color: tone.text }]}>
                      {lr.status}
                    </Text>
                  </View>
                </View>

                {lr.status === 'Pending' ? (
                  <Pressable
                    accessibilityLabel={`Cancel Leave ${lr.id}`}
                    onPress={() => onCancelLeave(lr.id)}
                    style={[
                      styles.cancelBtn,
                      { backgroundColor: palette.roseBg, borderColor: palette.rose },
                    ]}
                  >
                    <XCircle size={14} color={palette.rose} />
                    <Text style={[styles.cancelBtnText, { color: palette.rose }]}>
                      Cancel Pending Request
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  eyebrow: {
    fontFamily: FONT_SANS,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  balanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  balanceCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  balTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balCode: {
    fontFamily: FONT_MONO,
    fontSize: 12,
    fontWeight: '700',
  },
  balNum: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
    fontSize: 24,
    fontWeight: '700',
    marginTop: 2,
  },
  leaveRowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  cancelBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    minHeight: 36,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cancelBtnText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '700',
  },
});
