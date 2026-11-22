import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Award,
  Briefcase,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Megaphone,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { FONT_MONO, FONT_SANS, getPalette } from '../../theme/colors';
import {
  ManagerBottomTab,
  ManagerHomeSubTab,
  ManagerMoreModuleId,
  ManagerPortalState,
  computeManagerDashboardKpis,
  scopeTeamByManager,
} from '@/lib/manager-portal-logic';
import { getManagerStatusTone, mgrSharedStyles } from './ManagerSharedStyles';

interface ManagerOverviewTabProps {
  state: ManagerPortalState;
  isDark: boolean;
  onSelectHomeTab: (tab: ManagerHomeSubTab) => void;
  onNavigateBottom: (tab: ManagerBottomTab) => void;
  onOpenMoreModule: (mod: ManagerMoreModuleId) => void;
  onApproveItem: (approvalId: string) => void;
  onOpenRejectModal: (approvalId: string) => void;
}

export function ManagerOverviewTab({
  state,
  isDark,
  onSelectHomeTab,
  onNavigateBottom,
  onOpenMoreModule,
  onApproveItem,
  onOpenRejectModal,
}: ManagerOverviewTabProps) {
  const palette = getPalette(isDark);
  const kpis = computeManagerDashboardKpis(state);
  const scopedMembers = scopeTeamByManager(
    state.allTeamMembers,
    state.profile.managerId
  );
  const pendingApprovals = scopeTeamByManager(
    state.approvals,
    state.profile.managerId
  ).filter((a) => a.status === 'Pending');

  const snapshotMembers = scopedMembers.filter(
    (m) =>
      m.todayStatus === 'Late' ||
      m.todayStatus === 'On Leave' ||
      m.todayStatus === 'Remote'
  );

  return (
    <View style={styles.stack}>
      {/* 1. 2x2 KPI Summary Cards */}
      <View style={styles.kpiGrid}>
        <Pressable
          accessibilityLabel="Team Size KPI Card"
          onPress={() => onNavigateBottom('my_team')}
          style={[
            styles.kpiCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>
              Team Size
            </Text>
            <Users size={16} color={palette.primary} strokeWidth={2.2} />
          </View>
          <Text style={[styles.kpiVal, { color: palette.textPrimary }]}>
            {kpis.teamSize}
          </Text>
          <Text style={[styles.kpiSub, { color: palette.textSecondary }]}>
            {state.profile.departmentName}
          </Text>
          <View style={styles.kpiFooterRow}>
            <Text style={[styles.kpiMeta, { color: palette.primary }]}>
              View team
            </Text>
            <ChevronRight size={13} color={palette.primary} />
          </View>
        </Pressable>

        <Pressable
          accessibilityLabel="Team Attendance KPI Card"
          onPress={() => onNavigateBottom('my_team')}
          style={[
            styles.kpiCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>
              Team Attendance
            </Text>
            <UserCheck size={16} color={palette.emerald} strokeWidth={2.2} />
          </View>
          <Text style={[styles.kpiVal, { color: palette.emerald }]}>
            {kpis.attendanceRatePct}%
          </Text>
          <Text style={[styles.kpiSub, { color: palette.textSecondary }]}>
            {kpis.presentCount} Present / {kpis.onLeaveCount} On Leave
          </Text>
          <View style={styles.kpiFooterRow}>
            <Text style={[styles.kpiMeta, { color: palette.textMuted }]}>
              View logs
            </Text>
            <ChevronRight size={13} color={palette.textMuted} />
          </View>
        </Pressable>

        <Pressable
          accessibilityLabel="Pending Approvals KPI Card"
          onPress={() => onNavigateBottom('approvals')}
          style={[
            styles.kpiCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>
              Pending Approvals
            </Text>
            <ClipboardCheck size={16} color={palette.amber} strokeWidth={2.2} />
          </View>
          <Text style={[styles.kpiVal, { color: palette.amber }]}>
            {kpis.pendingApprovalsCount}
          </Text>
          <Text style={[styles.kpiSub, { color: palette.textSecondary }]}>
            Awaiting manager action
          </Text>
          <View style={styles.kpiFooterRow}>
            <Text style={[styles.kpiMeta, { color: palette.primary }]}>
              Review queue
            </Text>
            <ChevronRight size={13} color={palette.primary} />
          </View>
        </Pressable>

        <Pressable
          accessibilityLabel="Open Requisitions and Goals KPI Card"
          onPress={() => onOpenMoreModule('hiring')}
          style={[
            styles.kpiCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>
              Open Reqs &amp; Reviews
            </Text>
            <Briefcase size={16} color={palette.violet} strokeWidth={2.2} />
          </View>
          <Text style={[styles.kpiVal, { color: palette.textPrimary }]}>
            {kpis.openRequisitionsCount + kpis.pendingReviewsCount}
          </Text>
          <Text style={[styles.kpiSub, { color: palette.textSecondary }]}>
            {kpis.openRequisitionsCount} Hiring · {kpis.pendingReviewsCount} Reviews
          </Text>
          <View style={styles.kpiFooterRow}>
            <Text style={[styles.kpiMeta, { color: palette.primary }]}>
              Open tracker
            </Text>
            <ChevronRight size={13} color={palette.primary} />
          </View>
        </Pressable>
      </View>

      {/* 2. Quick Manager Actions (2x2 Grid Card) */}
      <View
        style={[
          mgrSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Text style={[mgrSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
          Quick Manager Actions
        </Text>
        <View style={styles.quickGrid}>
          <Pressable
            accessibilityLabel="Quick Action Review Approvals"
            onPress={() => onNavigateBottom('approvals')}
            style={[
              styles.quickBtn,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <CheckCircle2 size={18} color={palette.amber} strokeWidth={2.2} />
            <Text style={[styles.quickBtnTitle, { color: palette.textPrimary }]}>
              Review Approvals
            </Text>
            <Text style={[styles.quickBtnSub, { color: palette.textMuted }]}>
              Leaves, expenses &amp; swaps
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Quick Action Assign Roster"
            onPress={() => onSelectHomeTab('team_roster')}
            style={[
              styles.quickBtn,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <CalendarClock size={18} color={palette.primary} strokeWidth={2.2} />
            <Text style={[styles.quickBtnTitle, { color: palette.textPrimary }]}>
              Assign Roster
            </Text>
            <Text style={[styles.quickBtnSub, { color: palette.textMuted }]}>
              Plan weekly team shifts
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Quick Action Team Performance"
            onPress={() => onNavigateBottom('performance')}
            style={[
              styles.quickBtn,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <Award size={18} color={palette.emerald} strokeWidth={2.2} />
            <Text style={[styles.quickBtnTitle, { color: palette.textPrimary }]}>
              Team Performance
            </Text>
            <Text style={[styles.quickBtnSub, { color: palette.textMuted }]}>
              Rate KPIs &amp; give feedback
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Quick Action Hiring and Interviews"
            onPress={() => onOpenMoreModule('hiring')}
            style={[
              styles.quickBtn,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <Briefcase size={18} color={palette.violet} strokeWidth={2.2} />
            <Text style={[styles.quickBtnTitle, { color: palette.textPrimary }]}>
              Hiring &amp; Interviews
            </Text>
            <Text style={[styles.quickBtnSub, { color: palette.textMuted }]}>
              Candidates &amp; scorecards
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 3. Pending Team Approvals Widget */}
      <View
        style={[
          mgrSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={mgrSharedStyles.cardHeaderRow}>
          <Text style={[mgrSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
            Pending Team Approvals ({pendingApprovals.length})
          </Text>
          <Pressable
            accessibilityLabel="Open Approval Center"
            onPress={() => onNavigateBottom('approvals')}
          >
            <Text style={[mgrSharedStyles.linkText, { color: palette.primary }]}>
              Open Center
            </Text>
          </Pressable>
        </View>

        {pendingApprovals.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
              All direct report requests have been reviewed.
            </Text>
          </View>
        ) : (
          pendingApprovals.slice(0, 3).map((item, idx) => (
            <View
              key={item.id}
              style={[
                mgrSharedStyles.listRow,
                idx > 0
                  ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                  : null,
              ]}
            >
              <View style={styles.approvalTop}>
                <View style={[styles.avatarBadge, { backgroundColor: palette.primaryLight }]}>
                  <Text style={[styles.avatarText, { color: palette.primary }]}>
                    {item.initials}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.listName, { color: palette.textPrimary }]}>
                    {item.employeeName} · {item.requestTitle}
                  </Text>
                  <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                    {item.category} · {item.dateRange} · {item.durationOrAmount}
                  </Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  accessibilityLabel={`Approve ${item.employeeName} ${item.id}`}
                  onPress={() => onApproveItem(item.id)}
                  style={[styles.inlineApproveBtn, { backgroundColor: palette.emeraldBg }]}
                >
                  <Check size={14} color={palette.emerald} strokeWidth={2.5} />
                  <Text style={[styles.inlineBtnText, { color: palette.emerald }]}>
                    Approve
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityLabel={`Reject ${item.employeeName} ${item.id}`}
                  onPress={() => onOpenRejectModal(item.id)}
                  style={[styles.inlineRejectBtn, { backgroundColor: palette.roseBg }]}
                >
                  <X size={14} color={palette.rose} strokeWidth={2.5} />
                  <Text style={[styles.inlineBtnText, { color: palette.rose }]}>
                    Reject
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      {/* 4. Team Today Snapshot & Announcements Widget */}
      <View
        style={[
          mgrSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={mgrSharedStyles.cardHeaderRow}>
          <Text style={[mgrSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
            Team Today Snapshot ({snapshotMembers.length})
          </Text>
          <Pressable
            accessibilityLabel="View Full Team Status"
            onPress={() => onNavigateBottom('my_team')}
          >
            <Text style={[mgrSharedStyles.linkText, { color: palette.primary }]}>
              Directory
            </Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.snapshotScroll}
        >
          {snapshotMembers.map((m) => {
            const tone = getManagerStatusTone(m.todayStatus, palette);
            return (
              <Pressable
                key={m.id}
                accessibilityLabel={`Snapshot ${m.fullName} ${m.todayStatus}`}
                onPress={() => onNavigateBottom('my_team')}
                style={[
                  styles.snapshotChip,
                  { backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <View style={styles.snapshotHeader}>
                  <Text style={[styles.snapshotName, { color: palette.textPrimary }]}>
                    {m.fullName}
                  </Text>
                  <View style={[mgrSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                    <Text style={[mgrSharedStyles.statusBadgeText, { color: tone.text }]}>
                      {m.todayStatus}
                    </Text>
                  </View>
                </View>
                <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                  {m.designation}
                </Text>
                <Text
                  style={[
                    mgrSharedStyles.metaText,
                    mgrSharedStyles.monoText,
                    { color: palette.textSecondary, marginTop: 2 },
                  ]}
                >
                  {m.checkInTime !== '--' ? `In ${m.checkInTime}` : 'Approved Time Off'}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View
        style={[
          mgrSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={mgrSharedStyles.cardHeaderRow}>
          <Text style={[mgrSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
            Announcements &amp; Team Notices ({state.announcements.length})
          </Text>
          <Megaphone size={17} color={palette.violet} strokeWidth={2.2} />
        </View>

        {state.announcements.slice(0, 3).map((ann, idx) => (
          <View
            key={ann.id}
            style={[
              mgrSharedStyles.listRow,
              idx > 0
                ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                : null,
            ]}
          >
            <Text style={[styles.listName, { color: palette.textPrimary }]}>
              {ann.title}
            </Text>
            <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted, marginTop: 2 }]}>
              {ann.category} · {ann.department} · {ann.publishedDate}
            </Text>
            <Text style={[styles.annDesc, { color: palette.textSecondary }]}>
              {ann.description}
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
  approvalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '700',
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
  inlineApproveBtn: {
    flex: 1,
    minHeight: 38,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  inlineRejectBtn: {
    flex: 1,
    minHeight: 38,
    borderRadius: 12,
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
  snapshotScroll: {
    gap: 10,
    paddingRight: 6,
  },
  snapshotChip: {
    width: 210,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 3,
  },
  snapshotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  snapshotName: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  annDesc: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  emptyBox: {
    paddingVertical: 14,
    alignItems: 'center',
  },
});
