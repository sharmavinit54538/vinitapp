import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Briefcase, MapPin, TrendingDown, Users } from 'lucide-react';
import { FONT_MONO, FONT_SANS, getPalette } from '../../theme/colors';
import {
  ExecutiveDepartmentMetric,
  ExecutivePortalState,
} from '@/lib/executive-portal-logic';
import { execSharedStyles, getExecutiveStatusTone } from './ExecutiveSharedStyles';

interface ExecutiveWorkforceTabProps {
  state: ExecutivePortalState;
  isDark: boolean;
}

const LOCATION_FILTERS: (
  | 'All'
  | ExecutiveDepartmentMetric['primaryLocation']
)[] = ['All', 'Bengaluru HQ', 'Mumbai', 'Hyderabad', 'Remote'];

const EMPLOYMENT_FILTERS: ('All' | 'Full-Time' | 'Contract' | 'Intern')[] = [
  'All',
  'Full-Time',
  'Contract',
  'Intern',
];

export function ExecutiveWorkforceTab({
  state,
  isDark,
}: ExecutiveWorkforceTabProps) {
  const palette = getPalette(isDark);
  const [locationFilter, setLocationFilter] = useState<
    'All' | ExecutiveDepartmentMetric['primaryLocation']
  >('All');
  const [empFilter, setEmpFilter] = useState<
    'All' | 'Full-Time' | 'Contract' | 'Intern'
  >('All');

  const filteredDepts = useMemo(() => {
    return state.departments.filter((d) => {
      if (locationFilter !== 'All' && d.primaryLocation !== locationFilter) {
        return false;
      }
      if (empFilter === 'Contract' && d.contractCount === 0) return false;
      if (empFilter === 'Intern' && d.internCount === 0) return false;
      return true;
    });
  }, [state.departments, locationFilter, empFilter]);

  const totalFilteredHc = useMemo(
    () =>
      filteredDepts.reduce((sum, d) => {
        if (empFilter === 'Full-Time') return sum + d.fullTimeCount;
        if (empFilter === 'Contract') return sum + d.contractCount;
        if (empFilter === 'Intern') return sum + d.internCount;
        return sum + d.headcount;
      }, 0),
    [filteredDepts, empFilter]
  );

  const avgTimeToHire = useMemo(() => {
    if (!filteredDepts.length) return 26;
    return Math.round(
      filteredDepts.reduce((s, d) => s + d.avgTimeToHireDays, 0) /
        filteredDepts.length
    );
  }, [filteredDepts]);

  return (
    <View style={execSharedStyles.stack}>
      {/* Filters & Summary Card */}
      <View
        style={[
          execSharedStyles.cardCompact,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={execSharedStyles.cardHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={[execSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
              Workforce &amp; Org Intelligence
            </Text>
            <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
              Showing {totalFilteredHc} headcount across {filteredDepts.length} departments
            </Text>
          </View>
          <View
            style={[
              execSharedStyles.statusBadge,
              { backgroundColor: palette.primaryLight },
            ]}
          >
            <Text
              style={[
                execSharedStyles.statusBadgeText,
                execSharedStyles.monoText,
                { color: palette.primary },
              ]}
            >
              {avgTimeToHire}d Avg Hire
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {LOCATION_FILTERS.map((loc) => {
            const active = locationFilter === loc;
            return (
              <Pressable
                key={loc}
                accessibilityLabel={`Filter Location ${loc}`}
                onPress={() => setLocationFilter(loc)}
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
                  {loc}
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
          {EMPLOYMENT_FILTERS.map((type) => {
            const active = empFilter === type;
            return (
              <Pressable
                key={type}
                accessibilityLabel={`Filter Employment ${type}`}
                onPress={() => setEmpFilter(type)}
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
                  {type}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Department Headcount Breakdown */}
      <View
        style={[
          execSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={execSharedStyles.cardHeaderRow}>
          <Text style={[execSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
            Department Headcount Breakdown
          </Text>
          <Users size={16} color={palette.primary} />
        </View>

        {filteredDepts.length === 0 ? (
          <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
            No departments match the selected location and employment filter.
          </Text>
        ) : (
          filteredDepts.map((dept, idx) => {
            const countForFilter =
              empFilter === 'Full-Time'
                ? dept.fullTimeCount
                : empFilter === 'Contract'
                  ? dept.contractCount
                  : empFilter === 'Intern'
                    ? dept.internCount
                    : dept.headcount;
            const sharePct = Math.max(
              6,
              Math.round((countForFilter / Math.max(1, totalFilteredHc)) * 100)
            );
            const tone = getExecutiveStatusTone(dept.healthStatus, palette);
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
                <View style={styles.deptRowTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.deptTitle, { color: palette.textPrimary }]}>
                      {dept.department}
                    </Text>
                    <View style={styles.locRow}>
                      <MapPin size={11} color={palette.textMuted} />
                      <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
                        {dept.primaryLocation} · Lead: {dept.leadName}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text
                      style={[
                        styles.hcNum,
                        execSharedStyles.monoText,
                        { color: palette.textPrimary },
                      ]}
                    >
                      {countForFilter}
                    </Text>
                    <Text style={[execSharedStyles.metaText, { color: tone.text }]}>
                      {dept.attendanceRatePct}% att
                    </Text>
                  </View>
                </View>

                <View style={[styles.barTrack, { backgroundColor: palette.inputBg }]}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${sharePct}%`, backgroundColor: palette.primary },
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
                  FT {dept.fullTimeCount} · Contract {dept.contractCount} · Intern{' '}
                  {dept.internCount} · {dept.openRolesCount} open roles
                </Text>
              </View>
            );
          })
        )}
      </View>

      {/* Hiring Pipeline Funnel */}
      <View
        style={[
          execSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={execSharedStyles.cardHeaderRow}>
          <Text style={[execSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
            Hiring Pipeline Funnel
          </Text>
          <Briefcase size={16} color={palette.emerald} />
        </View>

        {state.hiringFunnel.map((stage, idx) => (
          <View
            key={stage.id}
            style={[
              styles.funnelRow,
              idx > 0
                ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                : null,
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[execSharedStyles.subTitle, { color: palette.textPrimary }]}>
                {stage.stage}
              </Text>
              <View style={[styles.barTrack, { backgroundColor: palette.inputBg, marginTop: 6 }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.max(12, stage.conversionPct)}%`,
                      backgroundColor: idx >= 3 ? palette.emerald : palette.primary,
                    },
                  ]}
                />
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', minWidth: 68 }}>
              <Text
                style={[
                  styles.hcNum,
                  execSharedStyles.monoText,
                  { color: palette.textPrimary },
                ]}
              >
                {stage.count}
              </Text>
              <Text
                style={[
                  execSharedStyles.metaText,
                  execSharedStyles.monoText,
                  { color: palette.textMuted },
                ]}
              >
                {stage.conversionPct}% conv
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Attrition Analytics */}
      <View
        style={[
          execSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={execSharedStyles.cardHeaderRow}>
          <Text style={[execSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
            Attrition &amp; Exit Drivers
          </Text>
          <TrendingDown size={16} color={palette.amber} />
        </View>

        <View style={styles.splitRow}>
          <View
            style={[
              styles.splitBox,
              { backgroundColor: palette.amberBg, borderColor: palette.amber },
            ]}
          >
            <Text style={[execSharedStyles.metaText, { color: palette.amber }]}>
              Voluntary Exits
            </Text>
            <Text
              style={[
                styles.splitVal,
                execSharedStyles.monoText,
                { color: palette.amber },
              ]}
            >
              {state.voluntaryExitPct}%
            </Text>
          </View>
          <View
            style={[
              styles.splitBox,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
              Involuntary Exits
            </Text>
            <Text
              style={[
                styles.splitVal,
                execSharedStyles.monoText,
                { color: palette.textPrimary },
              ]}
            >
              {state.involuntaryExitPct}%
            </Text>
          </View>
        </View>

        {state.attritionReasons.map((reason, idx) => (
          <View
            key={reason.id}
            style={[
              execSharedStyles.listRow,
              idx > 0
                ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                : null,
            ]}
          >
            <View style={styles.deptRowTop}>
              <Text style={[execSharedStyles.subTitle, { color: palette.textPrimary, flex: 1 }]}>
                {reason.reason}
              </Text>
              <Text
                style={[
                  execSharedStyles.subTitle,
                  execSharedStyles.monoText,
                  { color: reason.type === 'Voluntary' ? palette.amber : palette.textSecondary },
                ]}
              >
                {reason.sharePct}% ({reason.count})
              </Text>
            </View>
            <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
              {reason.type} separation · Trailing 12 months
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filterScroll: {
    gap: 8,
    paddingRight: 8,
  },
  deptRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  deptTitle: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '700',
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  hcNum: {
    fontSize: 16,
    fontWeight: '700',
  },
  barTrack: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  funnelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  splitBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 2,
  },
  splitVal: {
    fontSize: 20,
    fontWeight: '700',
  },
});
