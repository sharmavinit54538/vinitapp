import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BarChart3, ChevronRight, IndianRupee, TrendingUp } from 'lucide-react';
import { FONT_MONO, FONT_SANS, getPalette } from '../../theme/colors';
import {
  ExecutiveBottomTab,
  ExecutivePortalState,
  computeExecutiveDashboardKpis,
  formatInrCompact,
} from '@/lib/executive-portal-logic';
import { execSharedStyles, getExecutiveStatusTone } from './ExecutiveSharedStyles';

interface ExecutiveFinanceTabProps {
  state: ExecutivePortalState;
  isDark: boolean;
  onNavigateBottom: (tab: ExecutiveBottomTab) => void;
}

export function ExecutiveFinanceTab({
  state,
  isDark,
  onNavigateBottom,
}: ExecutiveFinanceTabProps) {
  const palette = getPalette(isDark);
  const kpis = computeExecutiveDashboardKpis(state);
  const { payrollCycle } = state;
  const cycleTone = getExecutiveStatusTone(payrollCycle.status, palette);

  const maxTrendCost = Math.max(
    ...payrollCycle.costPerEmpTrend.map((m) => m.costPerEmpInr),
    1
  );

  return (
    <View style={execSharedStyles.stack}>
      {/* 1. Monthly Payroll Disbursement Summary */}
      <View
        style={[
          execSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={execSharedStyles.cardHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={[execSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
              {payrollCycle.cycleLabel}
            </Text>
            <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
              Gross pay, statutory withholdings &amp; net disbursement
            </Text>
          </View>
          <View style={[execSharedStyles.statusBadge, { backgroundColor: cycleTone.bg }]}>
            <Text style={[execSharedStyles.statusBadgeText, { color: cycleTone.text }]}>
              {payrollCycle.status}
            </Text>
          </View>
        </View>

        <View style={styles.metricGrid}>
          <View
            style={[
              styles.metricTile,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
              Gross Pay
            </Text>
            <Text
              style={[
                styles.metricVal,
                execSharedStyles.monoText,
                { color: palette.textPrimary },
              ]}
            >
              {formatInrCompact(payrollCycle.grossPayInr)}
            </Text>
          </View>

          <View
            style={[
              styles.metricTile,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
              Statutory (PF/TDS)
            </Text>
            <Text
              style={[
                styles.metricVal,
                execSharedStyles.monoText,
                { color: palette.amber },
              ]}
            >
              {formatInrCompact(payrollCycle.statutoryDeductionsInr)}
            </Text>
          </View>

          <View
            style={[
              styles.metricTile,
              { backgroundColor: palette.emeraldBg, borderColor: palette.emerald },
            ]}
          >
            <Text style={[execSharedStyles.metaText, { color: palette.emerald }]}>
              Net Payout
            </Text>
            <Text
              style={[
                styles.metricVal,
                execSharedStyles.monoText,
                { color: palette.emerald },
              ]}
            >
              {formatInrCompact(payrollCycle.netPayoutInr)}
            </Text>
          </View>

          <View
            style={[
              styles.metricTile,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
              Reimbursements
            </Text>
            <Text
              style={[
                styles.metricVal,
                execSharedStyles.monoText,
                { color: palette.textPrimary },
              ]}
            >
              {formatInrCompact(payrollCycle.reimbursementsInr)}
            </Text>
          </View>
        </View>

        {payrollCycle.status === 'Awaiting Executive Sign-Off' ? (
          <Pressable
            accessibilityLabel="Review Payroll Batch in Approvals"
            onPress={() => onNavigateBottom('approvals')}
            style={[
              execSharedStyles.primaryBtn,
              { backgroundColor: palette.primary, marginTop: 12 },
            ]}
          >
            <IndianRupee size={15} color="#FFFFFF" />
            <Text style={execSharedStyles.primaryBtnText}>
              Sign Off Payroll Batch in Approvals
            </Text>
            <ChevronRight size={15} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </View>

      {/* 2. Department Salary & Expense Spend vs Allocated Budget */}
      <View
        style={[
          execSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={execSharedStyles.cardHeaderRow}>
          <Text style={[execSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
            Department Spend vs. Budget
          </Text>
          <BarChart3 size={16} color={palette.primary} />
        </View>

        {state.departments.map((dept, idx) => {
          const variance = dept.monthlyPayrollSpendInr - dept.monthlyBudgetInr;
          const over = variance > 0;
          const ratioPct = Math.min(
            100,
            Math.round(
              (dept.monthlyPayrollSpendInr / Math.max(1, dept.monthlyBudgetInr)) * 100
            )
          );
          return (
            <View
              key={dept.id}
              style={[
                execSharedStyles.listRow,
                idx > 0
                  ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                  : null,
              ]}
            >
              <View style={styles.deptHeader}>
                <Text style={[execSharedStyles.subTitle, { color: palette.textPrimary }]}>
                  {dept.department}
                </Text>
                <Text
                  style={[
                    execSharedStyles.metaText,
                    execSharedStyles.monoText,
                    { color: over ? palette.rose : palette.emerald, fontWeight: '700' },
                  ]}
                >
                  {over ? '+' : ''}
                  {formatInrCompact(variance)} {over ? 'over' : 'under'}
                </Text>
              </View>

              <View style={[styles.barTrack, { backgroundColor: palette.inputBg }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${ratioPct}%`,
                      backgroundColor: over ? palette.rose : palette.primary,
                    },
                  ]}
                />
              </View>

              <Text
                style={[
                  execSharedStyles.metaText,
                  execSharedStyles.monoText,
                  { color: palette.textMuted, marginTop: 4 },
                ]}
              >
                Actual {formatInrCompact(dept.monthlyPayrollSpendInr)} / Budget{' '}
                {formatInrCompact(dept.monthlyBudgetInr)} · OT{' '}
                {formatInrCompact(dept.overtimeCostInr)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* 3. Cost-Per-Employee & Overtime Cost Trend */}
      <View
        style={[
          execSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={execSharedStyles.cardHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={[execSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
              Cost-per-Employee &amp; OT Trend
            </Text>
            <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
              Current Avg: {formatInrCompact(kpis.avgCostPerEmployeeInr)}/emp · OT{' '}
              {formatInrCompact(kpis.totalOvertimeCostInr)}
            </Text>
          </View>
          <TrendingUp size={16} color={palette.amber} />
        </View>

        <View style={styles.trendList}>
          {payrollCycle.costPerEmpTrend.map((pt) => {
            const barWidth = Math.round((pt.costPerEmpInr / maxTrendCost) * 100);
            return (
              <View key={pt.month} style={styles.trendRow}>
                <Text
                  style={[
                    styles.trendMonth,
                    execSharedStyles.monoText,
                    { color: palette.textSecondary },
                  ]}
                >
                  {pt.month}
                </Text>
                <View style={[styles.trendTrack, { backgroundColor: palette.inputBg }]}>
                  <View
                    style={[
                      styles.trendFill,
                      { width: `${barWidth}%`, backgroundColor: palette.primary },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.trendVal,
                    execSharedStyles.monoText,
                    { color: palette.textPrimary },
                  ]}
                >
                  {formatInrCompact(pt.costPerEmpInr)} · {pt.overtimeLakhs}L OT
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricTile: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 3,
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '700',
  },
  deptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  barTrack: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 6,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  trendList: {
    gap: 10,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendMonth: {
    width: 32,
    fontSize: 12,
    fontWeight: '700',
  },
  trendTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  trendFill: {
    height: '100%',
    borderRadius: 4,
  },
  trendVal: {
    fontSize: 11,
    fontWeight: '600',
    minWidth: 118,
    textAlign: 'right',
  },
});
