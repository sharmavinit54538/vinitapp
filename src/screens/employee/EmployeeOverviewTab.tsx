import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  ChevronRight,
  Clock,
  FileBadge2,
  Megaphone,
  Receipt,
  ScanFace,
  UserCheck,
} from 'lucide-react';
import { FONT_MONO, FONT_SANS, getPalette } from '../../theme/colors';
import { AnnouncementItem } from '@/lib/hr-dashboard-logic';
import {
  EmployeeBottomTab,
  EmployeeHomeSubTab,
  EmployeePayrollDocsTab,
  EmployeePortalState,
  aggregateEmployeeRequests,
  computeEmployeeAttendanceMetrics,
  formatElapsedShiftDuration,
  getTotalRemainingLeaves,
} from '@/lib/employee-portal-logic';
import { empSharedStyles, getStatusTone } from './EmployeeSharedStyles';

interface EmployeeOverviewTabProps {
  state: EmployeePortalState;
  holidaysCount: number;
  announcements: AnnouncementItem[];
  isDark: boolean;
  onSelectHomeTab: (tab: EmployeeHomeSubTab) => void;
  onNavigateBottom: (tab: EmployeeBottomTab) => void;
  onOpenPayrollDocsSubTab: (sub: EmployeePayrollDocsTab) => void;
  onOpenFaceCheckIn: () => void;
  onOpenApplyLeave: () => void;
  onOpenRequestsCenter: () => void;
}

export function EmployeeOverviewTab({
  state,
  holidaysCount,
  announcements,
  isDark,
  onSelectHomeTab,
  onNavigateBottom,
  onOpenPayrollDocsSubTab,
  onOpenFaceCheckIn,
  onOpenApplyLeave,
  onOpenRequestsCenter,
}: EmployeeOverviewTabProps) {
  const palette = getPalette(isDark);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (state.todaySession.status !== 'Checked In') return;
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [state.todaySession.status]);

  const attendanceMetrics = computeEmployeeAttendanceMetrics(
    state.attendanceRecords,
    state.todaySession
  );
  const remainingLeaves = getTotalRemainingLeaves(state.leaveBalances);
  const aggregatedRequests = aggregateEmployeeRequests(state);
  const elapsedLabel = formatElapsedShiftDuration(
    state.todaySession.checkInIso,
    state.todaySession.checkOutIso,
    nowMs
  );

  const isCheckedIn = state.todaySession.status === 'Checked In';
  const isCheckedOut = state.todaySession.status === 'Checked Out';
  const todayValueText = isCheckedIn
    ? 'Checked In'
    : isCheckedOut
    ? 'Checked Out'
    : 'Not Checked In';
  const todayColor = isCheckedIn
    ? palette.emerald
    : isCheckedOut
    ? palette.primary
    : palette.amber;

  return (
    <View style={styles.stack}>
      {/* 1. 2x2 KPI Summary Cards (Matches HR Admin rounded-3xl p-5) */}
      <View style={styles.kpiGrid}>
        <Pressable
          accessibilityLabel="Today's Attendance Status Card"
          onPress={() => onNavigateBottom('attendance')}
          style={[
            styles.kpiCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>
              Today&apos;s Status
            </Text>
            <Clock size={16} color={todayColor} strokeWidth={2.2} />
          </View>
          <Text style={[styles.kpiStatusVal, { color: todayColor }]}>
            {todayValueText}
          </Text>
          <Text style={[styles.kpiSub, { color: palette.textSecondary }]}>
            {state.todaySession.checkInTime
              ? `In ${state.todaySession.checkInTime} · ${elapsedLabel}`
              : 'Tap Check-In to start shift'}
          </Text>
          <View style={styles.kpiFooterRow}>
            <Text style={[styles.kpiMeta, { color: palette.primary }]}>View logs</Text>
            <ChevronRight size={13} color={palette.primary} />
          </View>
        </Pressable>

        <Pressable
          accessibilityLabel="Monthly Attendance Rate Card"
          onPress={() => onNavigateBottom('attendance')}
          style={[
            styles.kpiCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>
              Attendance Rate
            </Text>
            <UserCheck size={16} color={palette.emerald} strokeWidth={2.2} />
          </View>
          <Text style={[styles.kpiVal, { color: palette.emerald }]}>
            {attendanceMetrics.attendanceRatePct}%
          </Text>
          <Text style={[styles.kpiSub, { color: palette.textSecondary }]}>
            {attendanceMetrics.presentDays} Present days
          </Text>
          <View style={styles.kpiFooterRow}>
            <Text style={[styles.kpiMeta, { color: palette.textMuted }]}>
              View history
            </Text>
            <ChevronRight size={13} color={palette.textMuted} />
          </View>
        </Pressable>

        <Pressable
          accessibilityLabel="Leave Balance Card"
          onPress={() => onNavigateBottom('leaves')}
          style={[
            styles.kpiCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>
              Leave Balance
            </Text>
            <CalendarCheck size={16} color={palette.primary} strokeWidth={2.2} />
          </View>
          <Text style={[styles.kpiVal, { color: palette.textPrimary }]}>
            {remainingLeaves}
          </Text>
          <Text style={[styles.kpiSub, { color: palette.textSecondary }]}>
            Paid &amp; casual days left
          </Text>
          <View style={styles.kpiFooterRow}>
            <Text style={[styles.kpiMeta, { color: palette.primary }]}>
              View balances
            </Text>
            <ChevronRight size={13} color={palette.primary} />
          </View>
        </Pressable>

        <Pressable
          accessibilityLabel="2026 Holidays Card"
          onPress={() => onSelectHomeTab('holidays')}
          style={[
            styles.kpiCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>
              2026 Holidays
            </Text>
            <CalendarDays size={16} color={palette.violet} strokeWidth={2.2} />
          </View>
          <Text style={[styles.kpiVal, { color: palette.textPrimary }]}>
            {holidaysCount}
          </Text>
          <Text style={[styles.kpiSub, { color: palette.textSecondary }]}>
            Corporate &amp; regional
          </Text>
          <View style={styles.kpiFooterRow}>
            <Text style={[styles.kpiMeta, { color: palette.primary }]}>
              Open calendar
            </Text>
            <ChevronRight size={13} color={palette.primary} />
          </View>
        </Pressable>
      </View>

      {/* 2. Quick Employee Actions (2x2 Grid Card) */}
      <View
        style={[
          empSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
          Quick Employee Actions
        </Text>
        <View style={styles.quickGrid}>
          <Pressable
            accessibilityLabel="Quick Action Face Check-In"
            onPress={onOpenFaceCheckIn}
            style={[
              styles.quickBtn,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <ScanFace size={18} color={palette.emerald} strokeWidth={2.2} />
            <Text style={[styles.quickBtnTitle, { color: palette.textPrimary }]}>
              {isCheckedIn ? 'Face Check-Out' : 'Face Check-In'}
            </Text>
            <Text style={[styles.quickBtnSub, { color: palette.textMuted }]}>
              Biometric &amp; geofence punch
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Quick Action Apply Leave"
            onPress={onOpenApplyLeave}
            style={[
              styles.quickBtn,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <CalendarPlus size={18} color={palette.primary} strokeWidth={2.2} />
            <Text style={[styles.quickBtnTitle, { color: palette.textPrimary }]}>
              Apply Leave
            </Text>
            <Text style={[styles.quickBtnSub, { color: palette.textMuted }]}>
              Request time off
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Quick Action My Payslips"
            onPress={() => onOpenPayrollDocsSubTab('payslips')}
            style={[
              styles.quickBtn,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <Receipt size={18} color={palette.amber} strokeWidth={2.2} />
            <Text style={[styles.quickBtnTitle, { color: palette.textPrimary }]}>
              My Payslips
            </Text>
            <Text style={[styles.quickBtnSub, { color: palette.textMuted }]}>
              Salary &amp; tax slips
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Quick Action My Documents"
            onPress={() => onOpenPayrollDocsSubTab('id_letters')}
            style={[
              styles.quickBtn,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <FileBadge2 size={18} color={palette.violet} strokeWidth={2.2} />
            <Text style={[styles.quickBtnTitle, { color: palette.textPrimary }]}>
              My Documents
            </Text>
            <Text style={[styles.quickBtnSub, { color: palette.textMuted }]}>
              ID card, letters &amp; KYC
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 3. My Requests Status Widget (Replaces HR Pending Approvals) */}
      <View
        style={[
          empSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={empSharedStyles.cardHeaderRow}>
          <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
            My Requests Status ({aggregatedRequests.counts.total})
          </Text>
          <Pressable
            accessibilityLabel="Open Requests Center"
            onPress={onOpenRequestsCenter}
          >
            <Text style={[empSharedStyles.linkText, { color: palette.primary }]}>
              Open Center
            </Text>
          </Pressable>
        </View>

        <View style={styles.statusSummaryRow}>
          <View style={[styles.statusSummaryBox, { backgroundColor: palette.amberBg }]}>
            <Text style={[styles.statusCountNum, { color: palette.amber }]}>
              {aggregatedRequests.counts.pending}
            </Text>
            <Text style={[styles.statusCountLbl, { color: palette.amber }]}>
              Pending
            </Text>
          </View>
          <View style={[styles.statusSummaryBox, { backgroundColor: palette.emeraldBg }]}>
            <Text style={[styles.statusCountNum, { color: palette.emerald }]}>
              {aggregatedRequests.counts.approved}
            </Text>
            <Text style={[styles.statusCountLbl, { color: palette.emerald }]}>
              Approved
            </Text>
          </View>
          <View style={[styles.statusSummaryBox, { backgroundColor: palette.roseBg }]}>
            <Text style={[styles.statusCountNum, { color: palette.rose }]}>
              {aggregatedRequests.counts.rejected}
            </Text>
            <Text style={[styles.statusCountLbl, { color: palette.rose }]}>
              Rejected
            </Text>
          </View>
        </View>

        {aggregatedRequests.items.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
              No leave, shift, expense, or helpdesk requests submitted yet.
            </Text>
          </View>
        ) : (
          aggregatedRequests.items.slice(0, 4).map((item, idx) => {
            const tone = getStatusTone(item.status, palette);
            return (
              <View
                key={item.id}
                style={[
                  empSharedStyles.listRow,
                  idx > 0
                    ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                    : null,
                ]}
              >
                <View style={styles.requestRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.listName, { color: palette.textPrimary }]}>
                      {item.title}
                    </Text>
                    <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                      {item.kind} · {item.subtitle}
                    </Text>
                  </View>
                  <View style={[empSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                    <Text style={[empSharedStyles.statusBadgeText, { color: tone.text }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* 4. Company Announcements Widget */}
      <View
        style={[
          empSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={empSharedStyles.cardHeaderRow}>
          <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
            Company Announcements ({announcements.length})
          </Text>
          <Megaphone size={17} color={palette.violet} strokeWidth={2.2} />
        </View>

        {announcements.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
              No active notices published by HR Admin right now.
            </Text>
          </View>
        ) : (
          announcements.slice(0, 4).map((ann, idx) => (
            <View
              key={ann.id}
              style={[
                empSharedStyles.listRow,
                idx > 0
                  ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                  : null,
              ]}
            >
              <Text style={[styles.listName, { color: palette.textPrimary }]}>
                {ann.title}
              </Text>
              <Text style={[empSharedStyles.metaText, { color: palette.textMuted, marginTop: 2 }]}>
                {ann.category} · {ann.department} · {ann.priority} Priority
              </Text>
              <Text style={[styles.annDesc, { color: palette.textSecondary }]}>
                {ann.description}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
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
  kpiStatusVal: {
    fontFamily: FONT_SANS,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 4,
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
  statusSummaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statusSummaryBox: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 2,
  },
  statusCountNum: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
    fontSize: 18,
    fontWeight: '700',
  },
  statusCountLbl: {
    fontFamily: FONT_SANS,
    fontSize: 11,
    fontWeight: '700',
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  listName: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '700',
  },
  annDesc: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
  },
  emptyBox: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
