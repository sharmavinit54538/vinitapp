import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Award, MessageSquarePlus, Star, Target } from 'lucide-react';
import { FONT_MONO, FONT_SANS, getPalette } from '../../theme/colors';
import {
  TeamAppraisalRecord,
  TeamGoalItem,
  scopeTeamByManager,
} from '@/lib/manager-portal-logic';
import { getManagerStatusTone, mgrSharedStyles } from './ManagerSharedStyles';

interface ManagerPerformanceTabProps {
  goals: TeamGoalItem[];
  appraisals: TeamAppraisalRecord[];
  managerId: string;
  isDark: boolean;
  onAddOneOnOneNote: (goalId: string, summary: string) => void;
  onSubmitAppraisal: (
    appraisalId: string,
    rating: number,
    feedback: string
  ) => void;
}

export function ManagerPerformanceTab({
  goals,
  appraisals,
  managerId,
  isDark,
  onAddOneOnOneNote,
  onSubmitAppraisal,
}: ManagerPerformanceTabProps) {
  const palette = getPalette(isDark);
  const scopedGoals = scopeTeamByManager(goals, managerId);
  const scopedAppraisals = scopeTeamByManager(appraisals, managerId);

  const [sectionTab, setSectionTab] = useState<'goals' | 'appraisals'>('goals');
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [ratingEdits, setRatingEdits] = useState<Record<string, number>>({});
  const [feedbackEdits, setFeedbackEdits] = useState<Record<string, string>>({});
  const [appraisalError, setAppraisalError] = useState<string | null>(null);

  const avgProgress =
    scopedGoals.length > 0
      ? Math.round(
          scopedGoals.reduce((sum, g) => sum + g.progressPct, 0) / scopedGoals.length
        )
      : 0;
  const pendingCount = scopedAppraisals.filter(
    (a) => a.status === 'Pending Review'
  ).length;

  return (
    <View style={mgrSharedStyles.stack}>
      {/* Summary + Segment Card */}
      <View
        style={[
          mgrSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={mgrSharedStyles.cardHeaderRow}>
          <View>
            <Text style={[mgrSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
              Team Performance &amp; Appraisals
            </Text>
            <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
              Q4 OKR Completion <Text style={mgrSharedStyles.monoText}>{avgProgress}%</Text> ·{' '}
              <Text style={mgrSharedStyles.monoText}>{pendingCount}</Text> Pending Reviews
            </Text>
          </View>
          <Award size={18} color={palette.emerald} />
        </View>

        <View style={styles.segRow}>
          <Pressable
            accessibilityLabel="Team Goals and 1-on-1s Tab"
            onPress={() => setSectionTab('goals')}
            style={[
              styles.segBtn,
              {
                backgroundColor:
                  sectionTab === 'goals' ? palette.primaryLight : palette.inputBg,
                borderColor: sectionTab === 'goals' ? palette.primary : palette.border,
              },
            ]}
          >
            <Target
              size={14}
              color={sectionTab === 'goals' ? palette.primary : palette.textMuted}
            />
            <Text
              style={[
                mgrSharedStyles.filterChipText,
                { color: sectionTab === 'goals' ? palette.primary : palette.textSecondary },
              ]}
            >
              OKRs &amp; 1-on-1s ({scopedGoals.length})
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Team Appraisals Tab"
            onPress={() => setSectionTab('appraisals')}
            style={[
              styles.segBtn,
              {
                backgroundColor:
                  sectionTab === 'appraisals' ? palette.primaryLight : palette.inputBg,
                borderColor:
                  sectionTab === 'appraisals' ? palette.primary : palette.border,
              },
            ]}
          >
            <Star
              size={14}
              color={sectionTab === 'appraisals' ? palette.primary : palette.textMuted}
            />
            <Text
              style={[
                mgrSharedStyles.filterChipText,
                {
                  color:
                    sectionTab === 'appraisals' ? palette.primary : palette.textSecondary,
                },
              ]}
            >
              Appraisals ({scopedAppraisals.length})
            </Text>
          </Pressable>
        </View>
      </View>

      {sectionTab === 'goals'
        ? scopedGoals.map((g) => {
            const tone = getManagerStatusTone(g.status, palette);
            const draftNote = noteInputs[g.id] || '';
            return (
              <View
                key={g.id}
                style={[
                  mgrSharedStyles.card,
                  { backgroundColor: palette.surface, borderColor: palette.border },
                ]}
              >
                <View style={mgrSharedStyles.cardHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
                      {g.employeeName} · {g.quarter}
                    </Text>
                    <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                      KPI: {g.kpiMetric}
                    </Text>
                  </View>
                  <View style={[mgrSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                    <Text style={[mgrSharedStyles.statusBadgeText, { color: tone.text }]}>
                      {g.status}
                    </Text>
                  </View>
                </View>

                <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
                  {g.title}
                </Text>

                <View style={styles.progressHeader}>
                  <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                    Goal Progress
                  </Text>
                  <Text
                    style={[
                      mgrSharedStyles.metaText,
                      mgrSharedStyles.monoText,
                      { color: palette.primary, fontWeight: '700' },
                    ]}
                  >
                    {g.progressPct}%
                  </Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: palette.surfaceMuted }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${g.progressPct}%`,
                        backgroundColor:
                          g.status === 'At Risk' ? palette.rose : palette.emerald,
                      },
                    ]}
                  />
                </View>

                {g.oneOnOneNotes.length > 0 ? (
                  <View style={styles.notesList}>
                    {g.oneOnOneNotes.map((n) => (
                      <View
                        key={n.id}
                        style={[styles.noteBubble, { backgroundColor: palette.inputBg }]}
                      >
                        <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted, fontSize: 10 }]}>
                          1-on-1 · {n.date}
                        </Text>
                        <Text style={[mgrSharedStyles.metaText, { color: palette.textPrimary }]}>
                          {n.summary}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                <View style={styles.noteInputRow}>
                  <TextInput
                    accessibilityLabel={`Add 1-on-1 Note for ${g.employeeName}`}
                    value={draftNote}
                    onChangeText={(txt) =>
                      setNoteInputs((prev) => ({ ...prev, [g.id]: txt }))
                    }
                    placeholder="Add 1-on-1 coaching note..."
                    placeholderTextColor={palette.textMuted}
                    style={[
                      mgrSharedStyles.input,
                      {
                        flex: 1,
                        backgroundColor: palette.inputBg,
                        borderColor: palette.border,
                        color: palette.textPrimary,
                      },
                    ]}
                  />
                  <Pressable
                    accessibilityLabel={`Save 1-on-1 Note for ${g.employeeName}`}
                    onPress={() => {
                      if (draftNote.trim().length < 4) return;
                      onAddOneOnOneNote(g.id, draftNote.trim());
                      setNoteInputs((prev) => ({ ...prev, [g.id]: '' }));
                    }}
                    style={[mgrSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
                  >
                    <MessageSquarePlus size={15} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>
            );
          })
        : scopedAppraisals.map((appr) => {
            const tone = getManagerStatusTone(appr.status, palette);
            const activeRating = ratingEdits[appr.id] ?? appr.rating;
            const activeFeedback = feedbackEdits[appr.id] ?? appr.feedback;
            return (
              <View
                key={appr.id}
                style={[
                  mgrSharedStyles.card,
                  { backgroundColor: palette.surface, borderColor: palette.border },
                ]}
              >
                <View style={mgrSharedStyles.cardHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
                      {appr.employeeName} · {appr.cycle}
                    </Text>
                    <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                      {appr.designation} · {appr.competencyHighlight}
                    </Text>
                  </View>
                  <View style={[mgrSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                    <Text style={[mgrSharedStyles.statusBadgeText, { color: tone.text }]}>
                      {appr.status}
                    </Text>
                  </View>
                </View>

                {appraisalError ? (
                  <View
                    style={[
                      mgrSharedStyles.errorBanner,
                      { backgroundColor: palette.roseBg, borderColor: palette.rose },
                    ]}
                  >
                    <Text style={[mgrSharedStyles.errorBannerText, { color: palette.rose }]}>
                      {appraisalError}
                    </Text>
                  </View>
                ) : null}

                <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                  Performance Rating (1–5)
                </Text>
                <View style={[mgrSharedStyles.chipRow, { marginBottom: 10 }]}>
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const active = activeRating === starVal;
                    return (
                      <Pressable
                        key={starVal}
                        accessibilityLabel={`Rate ${appr.employeeName} ${starVal}`}
                        onPress={() =>
                          setRatingEdits((prev) => ({ ...prev, [appr.id]: starVal }))
                        }
                        style={[
                          mgrSharedStyles.filterChip,
                          {
                            flexDirection: 'row',
                            gap: 4,
                            backgroundColor: active
                              ? palette.primaryLight
                              : palette.inputBg,
                            borderColor: active ? palette.primary : palette.border,
                          },
                        ]}
                      >
                        <Star
                          size={13}
                          color={active ? palette.primary : palette.textMuted}
                          fill={active ? palette.primary : 'transparent'}
                        />
                        <Text
                          style={[
                            mgrSharedStyles.filterChipText,
                            mgrSharedStyles.monoText,
                            {
                              color: active ? palette.primary : palette.textSecondary,
                            },
                          ]}
                        >
                          {starVal}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                  Manager Appraisal Feedback
                </Text>
                <TextInput
                  accessibilityLabel={`Feedback for ${appr.employeeName}`}
                  value={activeFeedback}
                  onChangeText={(txt) => {
                    setFeedbackEdits((prev) => ({ ...prev, [appr.id]: txt }));
                    setAppraisalError(null);
                  }}
                  multiline
                  placeholder="Enter competency review and next-quarter growth focus..."
                  placeholderTextColor={palette.textMuted}
                  style={[
                    mgrSharedStyles.textArea,
                    {
                      backgroundColor: palette.inputBg,
                      borderColor: palette.border,
                      color: palette.textPrimary,
                    },
                  ]}
                />

                <Pressable
                  accessibilityLabel={`Submit Appraisal ${appr.employeeName}`}
                  onPress={() => {
                    if (activeFeedback.trim().length < 8) {
                      setAppraisalError(
                        'Please provide manager review feedback (min 8 characters).'
                      );
                      return;
                    }
                    setAppraisalError(null);
                    onSubmitAppraisal(appr.id, activeRating, activeFeedback.trim());
                  }}
                  style={[
                    mgrSharedStyles.primaryBtn,
                    { backgroundColor: palette.primary, marginTop: 12 },
                  ]}
                >
                  <Text style={mgrSharedStyles.primaryBtnText}>
                    {appr.status === 'Submitted' ? 'Update Appraisal' : 'Submit Appraisal'}
                  </Text>
                </Pressable>
              </View>
            );
          })}
    </View>
  );
}

const styles = StyleSheet.create({
  segRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 4,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  notesList: {
    gap: 6,
    marginTop: 10,
  },
  noteBubble: {
    borderRadius: 12,
    padding: 10,
    gap: 2,
  },
  noteInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
});
