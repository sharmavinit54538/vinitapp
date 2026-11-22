import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileSpreadsheet,
  IndianRupee,
  Megaphone,
  PauseCircle,
  Sparkles,
  TrendingDown,
  Users,
} from 'lucide-react';
import { FONT_MONO, FONT_SANS, getPalette } from '../../theme/colors';
import {
  ExecutiveApprovalItem,
  ExecutiveBottomTab,
  ExecutiveHomeSubTab,
  ExecutiveMoreModuleId,
  ExecutivePortalState,
  computeExecutiveDashboardKpis,
  formatInrCompact,
} from '@/lib/executive-portal-logic';
import { execSharedStyles, getExecutiveStatusTone } from './ExecutiveSharedStyles';

interface ExecutiveOverviewTabProps {
  state: ExecutivePortalState;
  isDark: boolean;
  onSelectHomeTab: (tab: ExecutiveHomeSubTab) => void;
  onNavigateBottom: (tab: ExecutiveBottomTab) => void;
  onOpenMoreModule: (mod: ExecutiveMoreModuleId) => void;
  onOpenBroadcastModal: () => void;
  onApproveItem: (approvalId: string) => void;
  onHoldItem: (item: ExecutiveApprovalItem) => void;
}

export function ExecutiveOverviewTab({
  state,
  isDark,
  onSelectHomeTab,
  onNavigateBottom,
  onOpenMoreModule,
  onOpenBroadcastModal,
  onApproveItem,
  onHoldItem,
}: ExecutiveOverviewTabProps) {
  const palette = getPalette(isDark);
  const kpis = useMemo(() => computeExecutiveDashboardKpis(state), [state]);

  const prioritizedApprovals = useMemo(() => {
    const pending = state.approvals.filter((a) => a.status === 'Pending');
    if (state.activeLens === 'all') return pending.slice(0, 3);
    return [...pending]
      .sort((a, b) => {
        const aMatch = a.lensOwner === state.activeLens ? 0 : 1;
        const bMatch = b.lensOwner === state.activeLens ? 0 : 1;
        return aMatch - bMatch;
      })
      .slice(0, 3);
  }, [state.approvals, state.activeLens]);

  const prioritizedBriefs = useMemo(() => {
    if (state.activeLens === 'all') return state.aiBriefs;
    return [...state.aiBriefs].sort((a, b) => {
      const aMatch = a.lens === state.activeLens ? 0 : 1;
      const bMatch = b.lens === state.activeLens ? 0 : 1;
      return aMatch - bMatch;
    });
  }, [state.aiBriefs, state.activeLens]);

  return (
    <View style={styles.stack}>
      {/* 1. 2x2 KPI Summary Cards */}
      <View style={styles.kpiGrid}>
        <Pressable
          accessibilityLabel="Total Workforce KPI Card"
          onPress={() => onSelectHomeTab('workforce')}
          style={[
            styles.kpiCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.kpiTopRow}>
            <Text numberOfLines={1} style={[styles.kpiLabel, { color: palette.textMuted }]}>
              Total Workforce
            </Text>
            <Users size={16} color={palette.primary} strokeWidth={2.2} />
          </View>
          <Text style={[styles.kpiVal, { color: palette.textPrimary }]}>
            {kpis.totalWorkforce}
          </Text>
          <Text style={[styles.kpiSub, { color: palette.emerald }]}>
            +{kpis.momGrowthPct}% MoM net growth
          </Text>
          <View style={styles.kpiFooterRow}>
            <Text style={[styles.kpiMeta, { color: palette.primary }]}>View org</Text>
            <ChevronRight size={13} color={palette.primary} />
          </View>
        </Pressable>

        <Pressable
          accessibilityLabel="Monthly Payroll Burn KPI Card"
          onPress={() => onSelectHomeTab('finance')}
          style={[
            styles.kpiCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.kpiTopRow}>
            <Text numberOfLines={1} style={[styles.kpiLabel, { color: palette.textMuted }]}>
              Monthly Payroll
            </Text>
            <IndianRupee size={16} color={palette.emerald} strokeWidth={2.2} />
          </View>
          <Text style={[styles.kpiVal, { color: palette.textPrimary }]}>
            {formatInrCompact(kpis.monthlyPayrollBurnInr)}
          </Text>
          <Text
            style={[
              styles.kpiSub,
              {
                color:
                  kpis.budgetVariancePct > 1.5 ? palette.rose : palette.textSecondary,
              },
            ]}
          >
            {kpis.budgetVariancePct >= 0 ? '+' : ''}
            {kpis.budgetVariancePct}% vs budget
          </Text>
          <View style={styles.kpiFooterRow}>
            <Text style={[styles.kpiMeta, { color: palette.primary }]}>View finance</Text>
            <ChevronRight size={13} color={palette.primary} />
          </View>
        </Pressable>

        <Pressable
          accessibilityLabel="Org Attendance KPI Card"
          onPress={() => onSelectHomeTab('workforce')}
          style={[
            styles.kpiCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.kpiTopRow}>
            <Text numberOfLines={1} style={[styles.kpiLabel, { color: palette.textMuted }]}>
              Org Attendance
            </Text>
            <Activity size={16} color={palette.sky} strokeWidth={2.2} />
          </View>
          <Text style={[styles.kpiVal, { color: palette.emerald }]}>
            {kpis.orgAttendanceRatePct}%
          </Text>
          <Text style={[styles.kpiSub, { color: palette.textSecondary }]}>
            {kpis.activeDepartmentsCount} active departments
          </Text>
          <View style={styles.kpiFooterRow}>
            <Text style={[styles.kpiMeta, { color: palette.primary }]}>
              View breakdown
            </Text>
            <ChevronRight size={13} color={palette.primary} />
          </View>
        </Pressable>

        <Pressable
          accessibilityLabel="Attrition and Open Roles KPI Card"
          onPress={() => onSelectHomeTab('ai_insights')}
          style={[
            styles.kpiCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.kpiTopRow}>
            <Text numberOfLines={1} style={[styles.kpiLabel, { color: palette.textMuted }]}>
              Attrition &amp; Open
            </Text>
            <TrendingDown size={16} color={palette.amber} strokeWidth={2.2} />
          </View>
          <Text style={[styles.kpiVal, { color: palette.amber }]}>
            {kpis.annualizedAttritionPct.toFixed(1)}%
          </Text>
          <Text style={[styles.kpiSub, { color: palette.textSecondary }]}>
            {kpis.openRolesCount} critical open roles
          </Text>
          <View style={styles.kpiFooterRow}>
            <Text style={[styles.kpiMeta, { color: palette.primary }]}>View talent</Text>
            <ChevronRight size={13} color={palette.primary} />
          </View>
        </Pressable>
      </View>

      {/* 2. Quick Executive Actions (2x2 Grid Card) */}
      <View
        style={[
          execSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Text style={[execSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
          Quick Executive Actions
        </Text>
        <View style={styles.quickGrid}>
          <Pressable
            accessibilityLabel="Quick Action Executive Approvals"
            onPress={() => onNavigateBottom('approvals')}
            style={[
              styles.quickBtn,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <ClipboardCheck size={18} color={palette.primary} strokeWidth={2.2} />
            <Text style={[styles.quickBtnTitle, { color: palette.textPrimary }]}>
              Executive Approvals
            </Text>
            <Text style={[styles.quickBtnSub, { color: palette.textMuted }]}>
              Sign off payroll runs &amp; senior offers
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Quick Action AI Workforce Insights"
            onPress={() => onSelectHomeTab('ai_insights')}
            style={[
              styles.quickBtn,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <Sparkles size={18} color={palette.violet} strokeWidth={2.2} />
            <Text style={[styles.quickBtnTitle, { color: palette.textPrimary }]}>
              AI Workforce Insights
            </Text>
            <Text style={[styles.quickBtnSub, { color: palette.textMuted }]}>
              Attrition risks &amp; cost forecasts
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Quick Action Broadcast Notice"
            onPress={onOpenBroadcastModal}
            style={[
              styles.quickBtn,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <Megaphone size={18} color={palette.amber} strokeWidth={2.2} />
            <Text style={[styles.quickBtnTitle, { color: palette.textPrimary }]}>
              Broadcast Notice
            </Text>
            <Text style={[styles.quickBtnSub, { color: palette.textMuted }]}>
              Send company-wide announcement
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Quick Action Board and MIS Reports"
            onPress={() => onOpenMoreModule('board_reports')}
            style={[
              styles.quickBtn,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <FileSpreadsheet size={18} color={palette.emerald} strokeWidth={2.2} />
            <Text style={[styles.quickBtnTitle, { color: palette.textPrimary }]}>
              Board &amp; MIS Reports
            </Text>
            <Text style={[styles.quickBtnSub, { color: palette.textMuted }]}>
              Download executive KPI &amp; finance packs
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 3. Executive Sign-Offs & Escalations Widget */}
      <View
        style={[
          execSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={execSharedStyles.cardHeaderRow}>
          <Text style={[execSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
            Executive Sign-Offs &amp; Escalations
          </Text>
          <Pressable
            accessibilityLabel="Open Approvals Center"
            onPress={() => onNavigateBottom('approvals')}
          >
            <Text style={[execSharedStyles.linkText, { color: palette.primary }]}>
              Open Center
            </Text>
          </Pressable>
        </View>

        {prioritizedApprovals.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
              All C-Suite sign-offs and escalations have been actioned.
            </Text>
          </View>
        ) : (
          prioritizedApprovals.map((item, idx) => {
            const pTone = getExecutiveStatusTone(item.priority, palette);
            return (
              <View
                key={item.id}
                style={[
                  execSharedStyles.listRow,
                  idx > 0
                    ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                    : null,
                ]}
              >
                <View style={styles.itemTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.listName, { color: palette.textPrimary }]}>
                      {item.title}
                    </Text>
                    <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
                      {item.category} · {item.department} ·{' '}
                      <Text style={execSharedStyles.monoText}>{item.amountLabel}</Text>
                    </Text>
                  </View>
                  <View style={[execSharedStyles.statusBadge, { backgroundColor: pTone.bg }]}>
                    <Text style={[execSharedStyles.statusBadgeText, { color: pTone.text }]}>
                      {item.priority}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <Pressable
                    accessibilityLabel={`Approve ${item.referenceCode}`}
                    onPress={() => onApproveItem(item.id)}
                    style={[
                      styles.inlineActionBtn,
                      { backgroundColor: palette.emeraldBg },
                    ]}
                  >
                    <CheckCircle2 size={14} color={palette.emerald} strokeWidth={2.4} />
                    <Text style={[styles.inlineBtnText, { color: palette.emerald }]}>
                      Approve
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel={`Hold ${item.referenceCode}`}
                    onPress={() => onHoldItem(item)}
                    style={[
                      styles.inlineActionBtn,
                      { backgroundColor: palette.amberBg },
                    ]}
                  >
                    <PauseCircle size={14} color={palette.amber} strokeWidth={2.3} />
                    <Text style={[styles.inlineBtnText, { color: palette.amber }]}>
                      Hold
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* 4. AI Strategic Brief & Department Health Scorecard Widget */}
      <View
        style={[
          execSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={execSharedStyles.cardHeaderRow}>
          <Text style={[execSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
            AI Strategic Brief
          </Text>
          <Pressable
            accessibilityLabel="Open AI Insights Tab"
            onPress={() => onSelectHomeTab('ai_insights')}
          >
            <Text style={[execSharedStyles.linkText, { color: palette.primary }]}>
              Explore AI
            </Text>
          </Pressable>
        </View>

        {prioritizedBriefs.slice(0, 3).map((brief, idx) => {
          const bTone = getExecutiveStatusTone(brief.severity, palette);
          return (
            <Pressable
              key={brief.id}
              accessibilityLabel={`AI Brief ${brief.title}`}
              onPress={() =>
                brief.targetTab === 'approvals'
                  ? onNavigateBottom('approvals')
                  : onSelectHomeTab(brief.targetTab)
              }
              style={[
                execSharedStyles.listRow,
                idx > 0
                  ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                  : null,
              ]}
            >
              <View style={styles.itemTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.listName, { color: palette.textPrimary }]}>
                    {brief.title}
                  </Text>
                  <Text style={[execSharedStyles.metaText, { color: palette.textSecondary }]}>
                    {brief.summary}
                  </Text>
                </View>
                <View style={[execSharedStyles.statusBadge, { backgroundColor: bTone.bg }]}>
                  <Text
                    style={[
                      execSharedStyles.statusBadgeText,
                      execSharedStyles.monoText,
                      { color: bTone.text },
                    ]}
                  >
                    {brief.metricBadge}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}

        <View
          style={[
            styles.scorecardDivider,
            { borderTopColor: palette.borderSubtle },
          ]}
        >
          <View style={[execSharedStyles.cardHeaderRow, { marginBottom: 8 }]}>
            <Text style={[execSharedStyles.subTitle, { color: palette.textPrimary }]}>
              Department Health Scorecard
            </Text>
            <Pressable
              accessibilityLabel="Open Department Scorecards"
              onPress={() => onOpenMoreModule('scorecards')}
            >
              <Text style={[execSharedStyles.linkText, { color: palette.primary }]}>
                All 7 Depts
              </Text>
            </Pressable>
          </View>

          {state.departments.slice(0, 4).map((dept) => {
            const dTone = getExecutiveStatusTone(dept.healthStatus, palette);
            return (
              <View key={dept.id} style={styles.scoreRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.scoreDeptName, { color: palette.textPrimary }]}>
                    {dept.department}
                  </Text>
                  <Text
                    style={[
                      execSharedStyles.metaText,
                      execSharedStyles.monoText,
                      { color: palette.textMuted },
                    ]}
                  >
                    {dept.headcount} HC · {dept.attendanceRatePct}% att · {dept.annualizedAttritionPct}% attr
                  </Text>
                </View>
                <View style={[execSharedStyles.statusBadge, { backgroundColor: dTone.bg }]}>
                  <Text
                    style={[
                      execSharedStyles.statusBadgeText,
                      execSharedStyles.monoText,
                      { color: dTone.text },
                    ]}
                  >
                    {dept.healthScore}/100 · {dept.healthStatus}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
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
    fontSize: 25,
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
    alignItems: 'flex-start',
    gap: 10,
  },
  listName: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
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
  scorecardDivider: {
    marginTop: 10,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 7,
  },
  scoreDeptName: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyBox: {
    paddingVertical: 14,
    alignItems: 'center',
  },
});
