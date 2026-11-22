import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  ArrowLeft,
  BarChart3,
  Briefcase,
  CalendarPlus,
  ChevronRight,
  Download,
  FileBadge2,
  LogOut,
  Megaphone,
  Moon,
  Plus,
  ScanFace,
  Star,
  Sun,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import { FONT_MONO, FONT_SANS, getPalette } from '../../theme/colors';
import {
  HiringCandidate,
  ManagerMoreModuleId,
  ManagerPortalState,
  computeTeamAnalyticsSummary,
  scopeTeamByManager,
} from '@/lib/manager-portal-logic';
import { computePayslipTotals } from '@/lib/employee-portal-logic';
import { getManagerStatusTone, mgrSharedStyles } from './ManagerSharedStyles';

interface ManagerMoreTabProps {
  state: ManagerPortalState;
  activeModule: ManagerMoreModuleId | null;
  isDark: boolean;
  onSelectModule: (mod: ManagerMoreModuleId | null) => void;
  onToggleDarkMode: (next: boolean) => void;
  onOpenRaiseRequisition: () => void;
  onSubmitCandidateScorecard: (payload: {
    candidateId: string;
    decision: 'Hire' | 'Hold' | 'Reject';
    rating: number;
    notes: string;
  }) => void;
  onOpenSelfCheckIn: () => void;
  onOpenSelfLeaveModal: () => void;
  onOpenBroadcastNotice: () => void;
  onExportTeamReport: () => void;
  onNavigatePersonalPortal: () => void;
  onSaveProfile: (patch: { phone: string; location: string }) => void;
  onLogout: () => void;
}

export function ManagerMoreTab({
  state,
  activeModule,
  isDark,
  onSelectModule,
  onToggleDarkMode,
  onOpenRaiseRequisition,
  onSubmitCandidateScorecard,
  onOpenSelfCheckIn,
  onOpenSelfLeaveModal,
  onOpenBroadcastNotice,
  onExportTeamReport,
  onNavigatePersonalPortal,
  onSaveProfile,
  onLogout,
}: ManagerMoreTabProps) {
  const palette = getPalette(isDark);
  const scopedMembers = scopeTeamByManager(
    state.allTeamMembers,
    state.profile.managerId
  );
  const scopedGoals = scopeTeamByManager(
    state.teamGoals,
    state.profile.managerId
  );
  const scopedReqs = scopeTeamByManager(
    state.requisitions,
    state.profile.managerId
  );
  const scopedCandidates = scopeTeamByManager(
    state.candidates,
    state.profile.managerId
  );
  const analytics = computeTeamAnalyticsSummary(scopedMembers, scopedGoals);

  // Scorecard modal
  const [scorecardCandidate, setScorecardCandidate] =
    useState<HiringCandidate | null>(null);
  const [scoreDecision, setScoreDecision] = useState<'Hire' | 'Hold' | 'Reject'>(
    'Hire'
  );
  const [scoreRating, setScoreRating] = useState<number>(4);
  const [scoreNotes, setScoreNotes] = useState('');
  const [scoreError, setScoreError] = useState<string | null>(null);

  // Profile edit
  const [editPhone, setEditPhone] = useState(state.profile.phone);
  const [editLocation, setEditLocation] = useState(state.profile.location);

  const hubItems: {
    id: ManagerMoreModuleId;
    title: string;
    subtitle: string;
    badge: string;
    color: string;
    Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  }[] = [
    {
      id: 'hiring',
      title: 'Hiring & Interviews',
      subtitle: 'Requisitions & scorecards',
      badge: `${scopedReqs.length} Open Roles`,
      color: palette.violet,
      Icon: Briefcase,
    },
    {
      id: 'analytics',
      title: 'Team Analytics',
      subtitle: 'Attendance, leaves & OT',
      badge: `${analytics.avgAttendancePct}% Avg`,
      color: palette.emerald,
      Icon: BarChart3,
    },
    {
      id: 'self_service',
      title: 'My Self-Service',
      subtitle: 'My punch, leaves & payslips',
      badge: state.selfService.todayStatus,
      color: palette.primary,
      Icon: UserCheck,
    },
    {
      id: 'announcements',
      title: 'Announcements',
      subtitle: 'Company & team notices',
      badge: `${state.announcements.length} Notices`,
      color: palette.amber,
      Icon: Megaphone,
    },
    {
      id: 'profile',
      title: 'My Profile',
      subtitle: 'Contact, theme & sign out',
      badge: state.profile.managerId,
      color: palette.sky,
      Icon: User,
    },
  ];

  if (!activeModule) {
    return (
      <View style={mgrSharedStyles.stack}>
        <View
          style={[
            mgrSharedStyles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.profilePreviewRow}>
            <View style={[styles.avatarCircle, { backgroundColor: palette.primary }]}>
              <Text style={styles.avatarText}>{state.profile.avatarInitials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[mgrSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
                {state.profile.fullName}
              </Text>
              <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                {state.profile.designation} · {state.profile.managerId}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Open Manager Profile"
              onPress={() => onSelectModule('profile')}
              style={[
                mgrSharedStyles.filterChip,
                { backgroundColor: palette.primaryLight, borderColor: palette.primary },
              ]}
            >
              <Text style={[mgrSharedStyles.filterChipText, { color: palette.primary }]}>
                Edit
              </Text>
            </Pressable>
          </View>
        </View>

        <View
          style={[
            mgrSharedStyles.card,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
              paddingVertical: 6,
            },
          ]}
        >
          {hubItems.map((item, idx) => (
            <Pressable
              key={item.id}
              accessibilityLabel={`Open ${item.title}`}
              onPress={() => onSelectModule(item.id)}
              style={[
                mgrSharedStyles.listRow,
                idx > 0
                  ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                  : null,
              ]}
            >
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.hubTitle, { color: palette.textPrimary }]}>
                    {item.title}
                  </Text>
                  <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                    {item.subtitle}
                  </Text>
                </View>
                <Text style={[styles.hubBadge, { color: palette.textSecondary, marginTop: 0 }]}>
                  {item.badge}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={mgrSharedStyles.stack}>
      <Pressable
        accessibilityLabel="Back to Manager Hub"
        onPress={() => onSelectModule(null)}
        style={[
          styles.backBar,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <ArrowLeft size={16} color={palette.primary} />
        <Text style={[mgrSharedStyles.linkText, { color: palette.primary }]}>
          Back to Manager Hub
        </Text>
      </Pressable>

      {/* 1. HIRING & INTERVIEWS */}
      {activeModule === 'hiring' ? (
        <View style={mgrSharedStyles.stack}>
          <View
            style={[
              mgrSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={mgrSharedStyles.cardHeaderRow}>
              <Text style={[mgrSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
                Team Job Requisitions ({scopedReqs.length})
              </Text>
              <Pressable
                accessibilityLabel="Raise Hiring Requisition"
                onPress={onOpenRaiseRequisition}
                style={[mgrSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
              >
                <Plus size={15} color="#FFFFFF" />
                <Text style={mgrSharedStyles.primaryBtnText}>Raise Req</Text>
              </Pressable>
            </View>

            {scopedReqs.map((req, idx) => {
              const tone = getManagerStatusTone(req.status, palette);
              return (
                <View
                  key={req.id}
                  style={[
                    mgrSharedStyles.listRow,
                    idx > 0
                      ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                      : null,
                  ]}
                >
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
                        {req.title}
                      </Text>
                      <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                        {req.id} · {req.headcount} Opening(s) · {req.priority} · {req.hiringMode}
                      </Text>
                    </View>
                    <View style={[mgrSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                      <Text style={[mgrSharedStyles.statusBadgeText, { color: tone.text }]}>
                        {req.status}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          <View
            style={[
              mgrSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[mgrSharedStyles.sectionTitle, { color: palette.textPrimary, marginBottom: 8 }]}>
              Shortlisted Candidates &amp; Interviews ({scopedCandidates.length})
            </Text>
            {scopedCandidates.map((c, idx) => {
              const tone = getManagerStatusTone(c.decision || c.stage, palette);
              return (
                <View
                  key={c.id}
                  style={[
                    mgrSharedStyles.listRow,
                    idx > 0
                      ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                      : null,
                  ]}
                >
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
                        {c.name} ({c.experienceYears}y · {c.currentCompany})
                      </Text>
                      <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                        {c.requisitionTitle} · {c.interviewSlot}
                      </Text>
                      {c.scorecardNotes ? (
                        <Text style={[mgrSharedStyles.metaText, { color: palette.textSecondary, marginTop: 2 }]}>
                          Scorecard ({c.scorecardRating}/5): {c.scorecardNotes}
                        </Text>
                      ) : null}
                    </View>
                    <View style={[mgrSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                      <Text style={[mgrSharedStyles.statusBadgeText, { color: tone.text }]}>
                        {c.decision || c.stage}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    accessibilityLabel={`Open Scorecard ${c.name}`}
                    onPress={() => {
                      setScorecardCandidate(c);
                      setScoreDecision(c.decision || 'Hire');
                      setScoreRating(c.scorecardRating || 4);
                      setScoreNotes(c.scorecardNotes || '');
                      setScoreError(null);
                    }}
                    style={{ marginTop: 8, alignSelf: 'flex-start' }}
                  >
                    <Text style={[mgrSharedStyles.linkText, { color: palette.primary }]}>
                      {c.decision ? 'Edit Interview Scorecard →' : 'Submit Interview Scorecard →'}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* 2. TEAM ANALYTICS & REPORTS */}
      {activeModule === 'analytics' ? (
        <View style={mgrSharedStyles.stack}>
          <View
            style={[
              mgrSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={mgrSharedStyles.cardHeaderRow}>
              <Text style={[mgrSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
                Team Attendance &amp; Utilization
              </Text>
              <Pressable
                accessibilityLabel="Export Team Report"
                onPress={onExportTeamReport}
                style={[
                  mgrSharedStyles.filterChip,
                  {
                    flexDirection: 'row',
                    gap: 5,
                    backgroundColor: palette.primaryLight,
                    borderColor: palette.primary,
                  },
                ]}
              >
                <Download size={13} color={palette.primary} />
                <Text style={[mgrSharedStyles.filterChipText, { color: palette.primary }]}>
                  Export CSV
                </Text>
              </Pressable>
            </View>

            <View style={styles.statRow}>
              <View style={[styles.statBox, { backgroundColor: palette.inputBg }]}>
                <Text style={[styles.statVal, { color: palette.emerald }]}>
                  {analytics.avgAttendancePct}%
                </Text>
                <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                  Avg Attendance
                </Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: palette.inputBg }]}>
                <Text style={[styles.statVal, { color: palette.amber }]}>
                  {analytics.totalOvertimeHours}h
                </Text>
                <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                  Monthly Overtime
                </Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: palette.inputBg }]}>
                <Text style={[styles.statVal, { color: palette.primary }]}>
                  {analytics.avgLeaveBalanceDays}d
                </Text>
                <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                  Avg Leave Bal.
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              mgrSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[mgrSharedStyles.sectionTitle, { color: palette.textPrimary, marginBottom: 10 }]}>
              Member Punctuality &amp; Overtime Bars
            </Text>
            {scopedMembers.slice(0, 6).map((m) => (
              <View key={m.id} style={{ marginBottom: 12 }}>
                <View style={styles.rowBetween}>
                  <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    {m.fullName}
                  </Text>
                  <Text
                    style={[
                      mgrSharedStyles.metaText,
                      mgrSharedStyles.monoText,
                      { color: palette.textSecondary },
                    ]}
                  >
                    {m.monthlyAttendancePct}% · {m.overtimeHoursMonth}h OT
                  </Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: palette.surfaceMuted }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${m.monthlyAttendancePct}%`,
                        backgroundColor:
                          m.monthlyAttendancePct >= 95 ? palette.emerald : palette.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* 3. MANAGER PERSONAL SELF-SERVICE */}
      {activeModule === 'self_service' ? (
        <View style={mgrSharedStyles.stack}>
          <View
            style={[
              mgrSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={mgrSharedStyles.cardHeaderRow}>
              <View>
                <Text style={[mgrSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
                  My Personal Self-Service
                </Text>
                <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                  Status: {state.selfService.todayStatus} ({state.selfService.checkInTime || 'Not checked in'})
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Open Full Employee Portal"
                onPress={onNavigatePersonalPortal}
              >
                <Text style={[mgrSharedStyles.linkText, { color: palette.primary }]}>
                  Full ESS →
                </Text>
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                accessibilityLabel="Manager Personal Face Check-In"
                onPress={onOpenSelfCheckIn}
                style={[
                  mgrSharedStyles.primaryBtn,
                  { flex: 1, backgroundColor: palette.emerald },
                ]}
              >
                <ScanFace size={16} color="#FFFFFF" />
                <Text style={mgrSharedStyles.primaryBtnText}>
                  {state.selfService.todayStatus === 'Checked In'
                    ? 'Face Check-Out'
                    : 'Face Check-In'}
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Manager Apply Personal Leave"
                onPress={onOpenSelfLeaveModal}
                style={[
                  mgrSharedStyles.secondaryBtn,
                  {
                    flex: 1,
                    backgroundColor: palette.primaryLight,
                    borderColor: palette.primary,
                  },
                ]}
              >
                <CalendarPlus size={16} color={palette.primary} />
                <Text style={[mgrSharedStyles.secondaryBtnText, { color: palette.primary }]}>
                  Apply Leave
                </Text>
              </Pressable>
            </View>

            <View style={[styles.statRow, { marginTop: 14 }]}>
              {state.selfService.leaveBalances.map((b) => (
                <View key={b.key} style={[styles.statBox, { backgroundColor: palette.inputBg }]}>
                  <Text style={[styles.statVal, { color: palette.primary }]}>
                    {b.remaining}
                  </Text>
                  <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                    {b.code} Left
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View
            style={[
              mgrSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={mgrSharedStyles.cardHeaderRow}>
              <Text style={[mgrSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
                My Payslips &amp; Documents
              </Text>
              <FileBadge2 size={17} color={palette.primary} />
            </View>
            {state.selfService.payslips.map((slip) => {
              const totals = computePayslipTotals(slip);
              return (
                <View key={slip.id} style={styles.rowBetween}>
                  <View>
                    <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
                      {slip.monthLabel} Payslip
                    </Text>
                    <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                      Paid {slip.payDate} · {slip.bankAccountMasked}
                    </Text>
                  </View>
                  <Text
                    style={[
                      mgrSharedStyles.sectionTitle,
                      mgrSharedStyles.monoText,
                      { color: palette.emerald },
                    ]}
                  >
                    ₹{totals.netPay.toLocaleString('en-IN')}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* 4. ANNOUNCEMENTS */}
      {activeModule === 'announcements' ? (
        <View
          style={[
            mgrSharedStyles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={mgrSharedStyles.cardHeaderRow}>
            <Text style={[mgrSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
              Announcements ({state.announcements.length})
            </Text>
            <Pressable
              accessibilityLabel="Broadcast Team Notice Button"
              onPress={onOpenBroadcastNotice}
              style={[mgrSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
            >
              <Plus size={15} color="#FFFFFF" />
              <Text style={mgrSharedStyles.primaryBtnText}>Team Notice</Text>
            </Pressable>
          </View>
          {state.announcements.map((ann, idx) => (
            <View
              key={ann.id}
              style={[
                mgrSharedStyles.listRow,
                idx > 0
                  ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                  : null,
              ]}
            >
              <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
                {ann.title}
              </Text>
              <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                {ann.category} · {ann.department} · {ann.publishedDate}
              </Text>
              <Text style={[mgrSharedStyles.metaText, { color: palette.textSecondary, marginTop: 4 }]}>
                {ann.description}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* 5. MY PROFILE */}
      {activeModule === 'profile' ? (
        <View style={mgrSharedStyles.stack}>
          <View
            style={[
              mgrSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[mgrSharedStyles.sectionTitle, { color: palette.textPrimary, marginBottom: 10 }]}>
              Manager Profile &amp; Department Scope
            </Text>

            <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Mobile Number
            </Text>
            <TextInput
              accessibilityLabel="Manager Phone Input"
              value={editPhone}
              onChangeText={setEditPhone}
              style={[
                mgrSharedStyles.input,
                mgrSharedStyles.monoText,
                { backgroundColor: palette.inputBg, borderColor: palette.border, color: palette.textPrimary },
              ]}
            />

            <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 10 }]}>
              Office Hub Location
            </Text>
            <TextInput
              accessibilityLabel="Manager Location Input"
              value={editLocation}
              onChangeText={setEditLocation}
              style={[
                mgrSharedStyles.input,
                { backgroundColor: palette.inputBg, borderColor: palette.border, color: palette.textPrimary },
              ]}
            />

            <Pressable
              accessibilityLabel="Save Manager Profile"
              onPress={() =>
                onSaveProfile({
                  phone: editPhone.trim(),
                  location: editLocation.trim(),
                })
              }
              style={[mgrSharedStyles.primaryBtn, { backgroundColor: palette.primary, marginTop: 14 }]}
            >
              <Text style={mgrSharedStyles.primaryBtnText}>Save Profile Changes</Text>
            </Pressable>
          </View>

          <View
            style={[
              mgrSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {isDark ? <Moon size={18} color={palette.primary} /> : <Sun size={18} color={palette.amber} />}
                <View>
                  <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    Appearance Theme
                  </Text>
                  <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                    {isDark ? 'Dark mode enabled' : 'Light mode enabled'}
                  </Text>
                </View>
              </View>
              <Switch
                accessibilityLabel="Toggle Manager Dark Mode"
                value={isDark}
                onValueChange={onToggleDarkMode}
              />
            </View>

            <Pressable
              accessibilityLabel="Sign Out of Manager Portal"
              onPress={onLogout}
              style={[
                mgrSharedStyles.secondaryBtn,
                {
                  backgroundColor: palette.roseBg,
                  borderColor: palette.rose,
                  marginTop: 14,
                },
              ]}
            >
              <LogOut size={16} color={palette.rose} />
              <Text style={[mgrSharedStyles.secondaryBtnText, { color: palette.rose }]}>
                Sign Out
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* Candidate Interview Scorecard Modal */}
      <Modal
        visible={Boolean(scorecardCandidate)}
        transparent
        animationType="slide"
        onRequestClose={() => setScorecardCandidate(null)}
      >
        <View style={[mgrSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
          <View
            style={[
              mgrSharedStyles.modalSheet,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={mgrSharedStyles.dragHandleWrap}>
              <View style={[mgrSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
            </View>
            {scorecardCandidate ? (
              <>
                <View style={mgrSharedStyles.modalHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[mgrSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                      Interview Scorecard
                    </Text>
                    <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                      {scorecardCandidate.name} · {scorecardCandidate.requisitionTitle}
                    </Text>
                  </View>
                  <Pressable onPress={() => setScorecardCandidate(null)}>
                    <X size={20} color={palette.textMuted} />
                  </Pressable>
                </View>

                {scoreError ? (
                  <View
                    style={[
                      mgrSharedStyles.errorBanner,
                      { backgroundColor: palette.roseBg, borderColor: palette.rose },
                    ]}
                  >
                    <Text style={[mgrSharedStyles.errorBannerText, { color: palette.rose }]}>
                      {scoreError}
                    </Text>
                  </View>
                ) : null}

                <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                  Hiring Recommendation
                </Text>
                <View style={[mgrSharedStyles.chipRow, { marginBottom: 10 }]}>
                  {(['Hire', 'Hold', 'Reject'] as const).map((dec) => {
                    const active = scoreDecision === dec;
                    return (
                      <Pressable
                        key={dec}
                        accessibilityLabel={`Scorecard Decision ${dec}`}
                        onPress={() => setScoreDecision(dec)}
                        style={[
                          mgrSharedStyles.filterChip,
                          {
                            flex: 1,
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
                          {dec}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                  Technical &amp; Culture Fit Rating
                </Text>
                <View style={[mgrSharedStyles.chipRow, { marginBottom: 10 }]}>
                  {[1, 2, 3, 4, 5].map((r) => {
                    const active = scoreRating === r;
                    return (
                      <Pressable
                        key={r}
                        onPress={() => setScoreRating(r)}
                        style={[
                          mgrSharedStyles.filterChip,
                          {
                            flexDirection: 'row',
                            gap: 4,
                            backgroundColor: active ? palette.primaryLight : palette.inputBg,
                            borderColor: active ? palette.primary : palette.border,
                          },
                        ]}
                      >
                        <Star
                          size={12}
                          color={active ? palette.primary : palette.textMuted}
                          fill={active ? palette.primary : 'transparent'}
                        />
                        <Text
                          style={[
                            mgrSharedStyles.filterChipText,
                            mgrSharedStyles.monoText,
                            { color: active ? palette.primary : palette.textSecondary },
                          ]}
                        >
                          {r}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <TextInput
                  accessibilityLabel="Candidate Scorecard Notes"
                  value={scoreNotes}
                  onChangeText={(t) => {
                    setScoreNotes(t);
                    setScoreError(null);
                  }}
                  multiline
                  placeholder="Structured evaluation notes on system design, coding, and ownership..."
                  placeholderTextColor={palette.textMuted}
                  style={[
                    mgrSharedStyles.textArea,
                    { backgroundColor: palette.inputBg, borderColor: palette.border, color: palette.textPrimary },
                  ]}
                />

                <Pressable
                  accessibilityLabel="Submit Candidate Scorecard"
                  onPress={() => {
                    if (scoreNotes.trim().length < 6) {
                      setScoreError('Enter brief evaluation notes (min 6 characters).');
                      return;
                    }
                    onSubmitCandidateScorecard({
                      candidateId: scorecardCandidate.id,
                      decision: scoreDecision,
                      rating: scoreRating,
                      notes: scoreNotes.trim(),
                    });
                    setScorecardCandidate(null);
                  }}
                  style={[mgrSharedStyles.primaryBtn, { backgroundColor: palette.primary, marginTop: 14 }]}
                >
                  <Text style={mgrSharedStyles.primaryBtnText}>Save Scorecard Decision</Text>
                </Pressable>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  profilePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FONT_SANS,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  hubCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 4,
  },
  hubCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  hubIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubTitle: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '700',
  },
  hubBadge: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  backBar: {
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  statRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 2,
  },
  statVal: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
    fontSize: 18,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
