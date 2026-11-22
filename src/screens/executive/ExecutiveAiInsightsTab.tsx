import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  AlertTriangle,
  Bot,
  Minus,
  Plus,
  Send,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { FONT_SANS, getPalette } from '../../theme/colors';
import {
  ExecutivePortalState,
  computeScenarioProjection,
  formatInrCompact,
} from '@/lib/executive-portal-logic';
import { execSharedStyles, getExecutiveStatusTone } from './ExecutiveSharedStyles';

interface ExecutiveAiInsightsTabProps {
  state: ExecutivePortalState;
  isDark: boolean;
  onSubmitCopilotQuery: (query: string) => { valid: boolean; error?: string };
}

const COPILOT_SUGGESTIONS = [
  'Which department has highest overtime cost?',
  'Show attrition drivers & flight risks',
  'Summarize November payroll vs budget',
  'List pending executive approvals',
];

export function ExecutiveAiInsightsTab({
  state,
  isDark,
  onSubmitCopilotQuery,
}: ExecutiveAiInsightsTabProps) {
  const palette = getPalette(isDark);
  const [hcGrowthPct, setHcGrowthPct] = useState(5);
  const [attritionCutPct, setAttritionCutPct] = useState(2);
  const [otCapPct, setOtCapPct] = useState(20);
  const [queryText, setQueryText] = useState('');
  const [queryError, setQueryError] = useState<string | null>(null);

  const projection = useMemo(
    () =>
      computeScenarioProjection(state, {
        headcountGrowthPct: hcGrowthPct,
        attritionReductionPct: attritionCutPct,
        overtimeReductionPct: otCapPct,
      }),
    [state, hcGrowthPct, attritionCutPct, otCapPct]
  );

  const handleAsk = (textOverride?: string) => {
    const candidate = (textOverride ?? queryText).trim();
    const res = onSubmitCopilotQuery(candidate);
    if (!res.valid) {
      setQueryError(res.error || 'Enter a question for the AI Executive Copilot.');
      return;
    }
    setQueryError(null);
    if (!textOverride) {
      setQueryText('');
    }
  };

  return (
    <View style={execSharedStyles.stack}>
      {/* 1. AI Executive Copilot Query Card */}
      <View
        style={[
          execSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={execSharedStyles.cardHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <View style={[styles.botBadge, { backgroundColor: palette.primaryLight }]}>
              <Bot size={16} color={palette.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[execSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
                AI Executive Copilot
              </Text>
              <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
                Ask across payroll, attrition, overtime &amp; approvals
              </Text>
            </View>
          </View>
          <Sparkles size={16} color={palette.violet} />
        </View>

        {queryError ? (
          <View
            style={[
              execSharedStyles.errorBanner,
              { backgroundColor: palette.roseBg, borderColor: palette.rose },
            ]}
          >
            <Text style={[execSharedStyles.errorBannerText, { color: palette.rose }]}>
              {queryError}
            </Text>
          </View>
        ) : null}

        <View style={styles.promptRow}>
          <TextInput
            accessibilityLabel="Executive AI Copilot Query Input"
            value={queryText}
            onChangeText={(t) => {
              setQueryText(t);
              if (queryError) setQueryError(null);
            }}
            placeholder="Ask e.g. Which department has highest overtime?"
            placeholderTextColor={palette.textMuted}
            style={[
              execSharedStyles.input,
              {
                flex: 1,
                backgroundColor: palette.inputBg,
                borderColor: palette.border,
                color: palette.textPrimary,
              },
            ]}
          />
          <Pressable
            accessibilityLabel="Ask AI Copilot Button"
            onPress={() => handleAsk()}
            style={[
              styles.sendBtn,
              { backgroundColor: palette.primary },
            ]}
          >
            <Send size={16} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={[execSharedStyles.chipRow, { marginTop: 10 }]}>
          {COPILOT_SUGGESTIONS.map((s) => (
            <Pressable
              key={s}
              accessibilityLabel={`Copilot Prompt ${s}`}
              onPress={() => handleAsk(s)}
              style={[
                execSharedStyles.filterChip,
                { backgroundColor: palette.inputBg, borderColor: palette.border },
              ]}
            >
              <Text style={[execSharedStyles.filterChipText, { color: palette.primary }]}>
                {s}
              </Text>
            </Pressable>
          ))}
        </View>

        {state.copilotHistory.slice(0, 2).map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.answerBox,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <Text style={[styles.queryEcho, { color: palette.primary }]}>
              Q: {msg.query}
            </Text>
            <Text style={[execSharedStyles.metaText, { color: palette.textPrimary, marginTop: 4 }]}>
              {msg.answer}
            </Text>
            <View style={{ marginTop: 6, gap: 2 }}>
              {msg.highlights.map((h) => (
                <Text
                  key={h}
                  style={[
                    execSharedStyles.metaText,
                    execSharedStyles.monoText,
                    { color: palette.textSecondary, fontSize: 11 },
                  ]}
                >
                  • {h}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* 2. Scenario Planning & Cost Projection */}
      <View
        style={[
          execSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={execSharedStyles.cardHeaderRow}>
          <Text style={[execSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
            Headcount &amp; Cost Scenario Planner
          </Text>
          <Sliders size={16} color={palette.primary} />
        </View>

        <View style={styles.sliderGroup}>
          <View style={styles.stepperRow}>
            <View style={{ flex: 1 }}>
              <Text style={[execSharedStyles.subTitle, { color: palette.textPrimary }]}>
                Headcount Growth
              </Text>
              <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
                Projected size: {projection.projectedHeadcount} employees
              </Text>
            </View>
            <View style={styles.stepperControls}>
              <Pressable
                accessibilityLabel="Decrease Headcount Growth"
                onPress={() => setHcGrowthPct((v) => Math.max(-5, v - 1))}
                style={[
                  styles.stepBtn,
                  { backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <Minus size={14} color={palette.textPrimary} />
              </Pressable>
              <Text
                style={[
                  styles.stepVal,
                  execSharedStyles.monoText,
                  { color: palette.textPrimary },
                ]}
              >
                {hcGrowthPct >= 0 ? '+' : ''}
                {hcGrowthPct}%
              </Text>
              <Pressable
                accessibilityLabel="Increase Headcount Growth"
                onPress={() => setHcGrowthPct((v) => Math.min(20, v + 1))}
                style={[
                  styles.stepBtn,
                  { backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <Plus size={14} color={palette.textPrimary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.stepperRow}>
            <View style={{ flex: 1 }}>
              <Text style={[execSharedStyles.subTitle, { color: palette.textPrimary }]}>
                Attrition Reduction Target
              </Text>
              <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
                Retention savings: {formatInrCompact(projection.estimatedRetentionSavingsInr)}/yr
              </Text>
            </View>
            <View style={styles.stepperControls}>
              <Pressable
                accessibilityLabel="Decrease Attrition Reduction"
                onPress={() => setAttritionCutPct((v) => Math.max(0, v - 1))}
                style={[
                  styles.stepBtn,
                  { backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <Minus size={14} color={palette.textPrimary} />
              </Pressable>
              <Text
                style={[
                  styles.stepVal,
                  execSharedStyles.monoText,
                  { color: palette.emerald },
                ]}
              >
                -{attritionCutPct}%
              </Text>
              <Pressable
                accessibilityLabel="Increase Attrition Reduction"
                onPress={() => setAttritionCutPct((v) => Math.min(5, v + 1))}
                style={[
                  styles.stepBtn,
                  { backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <Plus size={14} color={palette.textPrimary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.stepperRow}>
            <View style={{ flex: 1 }}>
              <Text style={[execSharedStyles.subTitle, { color: palette.textPrimary }]}>
                Overtime Cap Reduction
              </Text>
              <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
                OT savings: {formatInrCompact(projection.overtimeAnnualSavingsInr)}/yr
              </Text>
            </View>
            <View style={styles.stepperControls}>
              <Pressable
                accessibilityLabel="Decrease Overtime Cap"
                onPress={() => setOtCapPct((v) => Math.max(0, v - 5))}
                style={[
                  styles.stepBtn,
                  { backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <Minus size={14} color={palette.textPrimary} />
              </Pressable>
              <Text
                style={[
                  styles.stepVal,
                  execSharedStyles.monoText,
                  { color: palette.primary },
                ]}
              >
                -{otCapPct}%
              </Text>
              <Pressable
                accessibilityLabel="Increase Overtime Cap"
                onPress={() => setOtCapPct((v) => Math.min(40, v + 5))}
                style={[
                  styles.stepBtn,
                  { backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <Plus size={14} color={palette.textPrimary} />
              </Pressable>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.projectionSummary,
            { backgroundColor: palette.primaryLight, borderColor: palette.primary },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[execSharedStyles.metaText, { color: palette.primary }]}>
              Projected Monthly Payroll
            </Text>
            <Text
              style={[
                styles.projNum,
                execSharedStyles.monoText,
                { color: palette.textPrimary },
              ]}
            >
              {formatInrCompact(projection.projectedMonthlyPayrollInr)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[execSharedStyles.metaText, { color: palette.primary }]}>
              Net Annual Delta
            </Text>
            <Text
              style={[
                styles.projNum,
                execSharedStyles.monoText,
                {
                  color:
                    projection.netAnnualBudgetImpactInr <= 0
                      ? palette.emerald
                      : palette.amber,
                },
              ]}
            >
              {projection.netAnnualBudgetImpactInr >= 0 ? '+' : ''}
              {formatInrCompact(projection.netAnnualBudgetImpactInr)}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. Predictive Flight-Risk Alerts */}
      <View
        style={[
          execSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={execSharedStyles.cardHeaderRow}>
          <Text style={[execSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
            Predictive Flight-Risk Alerts
          </Text>
          <AlertTriangle size={16} color={palette.rose} />
        </View>

        {state.flightRisks.map((risk, idx) => {
          const tone = getExecutiveStatusTone(risk.severity, palette);
          return (
            <View
              key={risk.id}
              style={[
                execSharedStyles.listRow,
                idx > 0
                  ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                  : null,
              ]}
            >
              <View style={styles.riskHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[execSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    {risk.department} · {risk.segmentLabel}
                  </Text>
                  <Text style={[execSharedStyles.metaText, { color: palette.textSecondary }]}>
                    Driver: {risk.driver}
                  </Text>
                </View>
                <View style={[execSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                  <Text
                    style={[
                      execSharedStyles.statusBadgeText,
                      execSharedStyles.monoText,
                      { color: tone.text },
                    ]}
                  >
                    {risk.riskScorePct}% Risk
                  </Text>
                </View>
              </View>
              <Text style={[execSharedStyles.metaText, { color: palette.primary, marginTop: 4 }]}>
                Recommended: {risk.recommendedAction}
              </Text>
            </View>
          );
        })}
      </View>

      {/* 4. Attendance & Productivity Anomalies */}
      <View
        style={[
          execSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Text style={[execSharedStyles.sectionTitle, { color: palette.textPrimary, marginBottom: 4 }]}>
          Attendance &amp; Productivity Anomalies
        </Text>
        {state.anomalies.map((anm, idx) => (
          <View
            key={anm.id}
            style={[
              execSharedStyles.listRow,
              idx > 0
                ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                : null,
            ]}
          >
            <View style={styles.riskHeader}>
              <Text style={[execSharedStyles.subTitle, { color: palette.textPrimary, flex: 1 }]}>
                {anm.title}
              </Text>
              <Text
                style={[
                  execSharedStyles.metaText,
                  execSharedStyles.monoText,
                  { color: palette.amber, fontWeight: '700' },
                ]}
              >
                {anm.detectedMetric}
              </Text>
            </View>
            <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
              {anm.department} · Baseline {anm.baselineMetric} · {anm.detectedAt}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  botBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerBox: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  queryEcho: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '700',
  },
  sliderGroup: {
    gap: 12,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepVal: {
    minWidth: 42,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
  },
  projectionSummary: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  projNum: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 2,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
});
