import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  CalendarClock,
  Check,
  Clock,
  Laptop,
  Mail,
  MapPin,
  Phone,
  Search,
  UserCheck,
  X,
} from 'lucide-react';
import { FONT_MONO, FONT_SANS, getPalette } from '../../theme/colors';
import {
  ManagerApprovalItem,
  ManagerShiftType,
  ROSTER_DAYS_OF_WEEK,
  RosterDayKey,
  SHIFT_TIMINGS_MAP,
  TeamAttendanceStatus,
  TeamMember,
  TeamRosterRow,
  scopeTeamByManager,
} from '@/lib/manager-portal-logic';
import { getManagerStatusTone, mgrSharedStyles } from './ManagerSharedStyles';

/* ============================================================================
 * 1. MY TEAM DIRECTORY & LIVE ATTENDANCE + PROFILE SHEET + REGULARIZATION
 * ========================================================================== */
interface ManagerMyTeamTabProps {
  members: TeamMember[];
  managerId: string;
  isDark: boolean;
  onRegularizePunch: (
    employeeId: string,
    nextStatus: TeamAttendanceStatus,
    reason: string
  ) => { valid: boolean; error?: string };
}

export function ManagerMyTeamTab({
  members,
  managerId,
  isDark,
  onRegularizePunch,
}: ManagerMyTeamTabProps) {
  const palette = getPalette(isDark);
  const scopedMembers = scopeTeamByManager(members, managerId);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TeamAttendanceStatus>('All');
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);

  // Regularization form state inside profile sheet
  const [regStatus, setRegStatus] = useState<TeamAttendanceStatus>('Present');
  const [regReason, setRegReason] = useState('');
  const [regError, setRegError] = useState<string | null>(null);

  const filtered = scopedMembers.filter((m) => {
    const matchesQuery =
      !query.trim() ||
      m.fullName.toLowerCase().includes(query.toLowerCase()) ||
      m.designation.toLowerCase().includes(query.toLowerCase()) ||
      m.employeeId.toLowerCase().includes(query.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || m.todayStatus === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const selectedMember = selectedEmpId
    ? scopedMembers.find((m) => m.employeeId === selectedEmpId) || null
    : null;

  return (
    <View style={mgrSharedStyles.stack}>
      <View
        style={[
          mgrSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Text style={[mgrSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
          Direct Reports Directory ({scopedMembers.length})
        </Text>
        <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted, marginTop: 2 }]}>
          Tap any teammate to inspect profile, leave balance, assets, or regularize punches
        </Text>

        <View
          style={[
            styles.searchBox,
            { backgroundColor: palette.inputBg, borderColor: palette.border },
          ]}
        >
          <Search size={16} color={palette.textMuted} />
          <TextInput
            accessibilityLabel="Search Team Members"
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, role, or employee ID..."
            placeholderTextColor={palette.textMuted}
            style={[styles.searchInput, { color: palette.textPrimary }]}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {(['All', 'Present', 'Remote', 'Late', 'On Leave', 'Absent'] as const).map(
            (st) => {
              const active = statusFilter === st;
              return (
                <Pressable
                  key={st}
                  accessibilityLabel={`Filter Team ${st}`}
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
            }
          )}
        </ScrollView>
      </View>

      {filtered.length === 0 ? (
        <View
          style={[
            mgrSharedStyles.card,
            { backgroundColor: palette.surface, borderColor: palette.border, alignItems: 'center' },
          ]}
        >
          <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
            No direct reports match your filter.
          </Text>
        </View>
      ) : (
        <View
          style={[
            mgrSharedStyles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          {filtered.map((m, idx) => {
            const tone = getManagerStatusTone(m.todayStatus, palette);
            return (
              <Pressable
                key={m.id}
                accessibilityLabel={`Open Profile ${m.fullName}`}
                onPress={() => {
                  setSelectedEmpId(m.employeeId);
                  setRegStatus('Present');
                  setRegReason('');
                  setRegError(null);
                }}
                style={[
                  mgrSharedStyles.listRow,
                  idx > 0
                    ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                    : null,
                ]}
              >
                <View style={styles.memberRow}>
                  <View style={[styles.avatarBox, { backgroundColor: palette.primaryLight }]}>
                    <Text style={[styles.avatarText, { color: palette.primary }]}>
                      {m.initials}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
                      {m.fullName}
                    </Text>
                    <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                      {m.designation} · {m.employeeId}
                    </Text>
                    <Text
                      style={[
                        mgrSharedStyles.metaText,
                        mgrSharedStyles.monoText,
                        { color: palette.textSecondary, marginTop: 2 },
                      ]}
                    >
                      {m.shiftType} · In {m.checkInTime} · {m.monthlyAttendancePct}%
                    </Text>
                  </View>
                  <View style={[mgrSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                    <Text style={[mgrSharedStyles.statusBadgeText, { color: tone.text }]}>
                      {m.todayStatus}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Team Member Profile & Regularization Sheet */}
      <Modal
        visible={Boolean(selectedMember)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedEmpId(null)}
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
            {selectedMember ? (
              <>
                <View style={mgrSharedStyles.modalHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <View style={[styles.avatarBox, { backgroundColor: palette.primary }]}>
                      <Text style={[styles.avatarText, { color: '#FFFFFF' }]}>
                        {selectedMember.initials}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[mgrSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                        {selectedMember.fullName}
                      </Text>
                      <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                        {selectedMember.designation} · {selectedMember.employeeId}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    accessibilityLabel="Close Member Profile Sheet"
                    onPress={() => setSelectedEmpId(null)}
                  >
                    <X size={20} color={palette.textMuted} />
                  </Pressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Contact & Shift Details */}
                  <View
                    style={[
                      styles.detailPanel,
                      { backgroundColor: palette.inputBg, borderColor: palette.borderSubtle },
                    ]}
                  >
                    <View style={styles.detailRow}>
                      <Mail size={14} color={palette.primary} />
                      <Text style={[mgrSharedStyles.metaText, { color: palette.textPrimary }]}>
                        {selectedMember.email}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Phone size={14} color={palette.emerald} />
                      <Text
                        style={[
                          mgrSharedStyles.metaText,
                          mgrSharedStyles.monoText,
                          { color: palette.textPrimary },
                        ]}
                      >
                        {selectedMember.phone}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MapPin size={14} color={palette.amber} />
                      <Text style={[mgrSharedStyles.metaText, { color: palette.textPrimary }]}>
                        {selectedMember.location}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Clock size={14} color={palette.violet} />
                      <Text style={[mgrSharedStyles.metaText, { color: palette.textPrimary }]}>
                        {selectedMember.shiftType} ({selectedMember.shiftTiming})
                      </Text>
                    </View>
                  </View>

                  {/* Monthly Attendance, Leaves & Goals */}
                  <View style={styles.statTripleRow}>
                    <View
                      style={[
                        styles.miniStatBox,
                        { backgroundColor: palette.inputBg, borderColor: palette.borderSubtle },
                      ]}
                    >
                      <Text style={[styles.miniStatVal, { color: palette.emerald }]}>
                        {selectedMember.monthlyAttendancePct}%
                      </Text>
                      <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                        {selectedMember.presentDays}d Present
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.miniStatBox,
                        { backgroundColor: palette.inputBg, borderColor: palette.borderSubtle },
                      ]}
                    >
                      <Text style={[styles.miniStatVal, { color: palette.primary }]}>
                        {selectedMember.leaveBalance.el +
                          selectedMember.leaveBalance.cl +
                          selectedMember.leaveBalance.sl}
                      </Text>
                      <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                        Leaves Left
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.miniStatBox,
                        { backgroundColor: palette.inputBg, borderColor: palette.borderSubtle },
                      ]}
                    >
                      <Text style={[styles.miniStatVal, { color: palette.amber }]}>
                        {selectedMember.goalProgressPct}%
                      </Text>
                      <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                        Q4 Goals
                      </Text>
                    </View>
                  </View>

                  {/* Assigned Assets */}
                  <View style={{ marginTop: 12 }}>
                    <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                      Assigned Hardware &amp; Assets
                    </Text>
                    {selectedMember.assignedAssets.map((ast) => (
                      <View key={ast} style={[styles.detailRow, { marginBottom: 4 }]}>
                        <Laptop size={14} color={palette.textMuted} />
                        <Text style={[mgrSharedStyles.metaText, { color: palette.textPrimary }]}>
                          {ast}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Regularize Attendance Section */}
                  <View
                    style={[
                      styles.regBox,
                      { borderColor: palette.border, backgroundColor: palette.surfaceMuted },
                    ]}
                  >
                    <View style={styles.detailRow}>
                      <UserCheck size={15} color={palette.primary} />
                      <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
                        Regularize / Correct Today&apos;s Punch
                      </Text>
                    </View>

                    {regError ? (
                      <View
                        style={[
                          mgrSharedStyles.errorBanner,
                          { backgroundColor: palette.roseBg, borderColor: palette.rose, marginTop: 8 },
                        ]}
                      >
                        <Text style={[mgrSharedStyles.errorBannerText, { color: palette.rose }]}>
                          {regError}
                        </Text>
                      </View>
                    ) : null}

                    <View style={[mgrSharedStyles.chipRow, { marginTop: 8 }]}>
                      {(['Present', 'Remote', 'Checked Out', 'On Leave'] as const).map(
                        (st) => {
                          const active = regStatus === st;
                          return (
                            <Pressable
                              key={st}
                              accessibilityLabel={`Regularize Status ${st}`}
                              onPress={() => {
                                setRegStatus(st);
                                setRegError(null);
                              }}
                              style={[
                                mgrSharedStyles.filterChip,
                                {
                                  backgroundColor: active ? palette.primaryLight : palette.surface,
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
                        }
                      )}
                    </View>

                    <TextInput
                      accessibilityLabel="Regularization Audit Reason"
                      value={regReason}
                      onChangeText={(t) => {
                        setRegReason(t);
                        setRegError(null);
                      }}
                      placeholder="Audit reason (e.g. Client site visit, biometric sync delay)..."
                      placeholderTextColor={palette.textMuted}
                      style={[
                        mgrSharedStyles.input,
                        {
                          backgroundColor: palette.surface,
                          borderColor: palette.border,
                          color: palette.textPrimary,
                          marginTop: 8,
                        },
                      ]}
                    />

                    <Pressable
                      accessibilityLabel="Save Punch Regularization"
                      onPress={() => {
                        const res = onRegularizePunch(
                          selectedMember.employeeId,
                          regStatus,
                          regReason
                        );
                        if (!res.valid) {
                          setRegError(res.error || 'Reason required');
                          return;
                        }
                        setRegReason('');
                        setRegError(null);
                      }}
                      style={[
                        mgrSharedStyles.primaryBtn,
                        { backgroundColor: palette.primary, marginTop: 10 },
                      ]}
                    >
                      <Text style={mgrSharedStyles.primaryBtnText}>
                        Apply Punch Regularization
                      </Text>
                    </Pressable>

                    {selectedMember.regularizationHistory.length > 0 ? (
                      <View style={{ marginTop: 10, gap: 4 }}>
                        <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textMuted }]}>
                          Audit Trail ({selectedMember.regularizationHistory.length})
                        </Text>
                        {selectedMember.regularizationHistory.map((h) => (
                          <Text
                            key={h.id}
                            style={[mgrSharedStyles.metaText, { color: palette.textSecondary }]}
                          >
                            {h.updatedAt}: {h.previousStatus} → {h.nextStatus} ({h.reason})
                          </Text>
                        ))}
                      </View>
                    ) : null}
                  </View>
                </ScrollView>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ============================================================================
 * 2. TEAM SHIFTS VIEW (COVERAGE + PENDING SHIFT SWAPS)
 * ========================================================================== */
interface ManagerTeamShiftsViewProps {
  members: TeamMember[];
  approvals: ManagerApprovalItem[];
  managerId: string;
  isDark: boolean;
  onOpenAssignShiftModal: () => void;
  onApproveSwap: (id: string) => void;
  onOpenRejectSwap: (id: string) => void;
}

export function ManagerTeamShiftsView({
  members,
  approvals,
  managerId,
  isDark,
  onOpenAssignShiftModal,
  onApproveSwap,
  onOpenRejectSwap,
}: ManagerTeamShiftsViewProps) {
  const palette = getPalette(isDark);
  const scopedMembers = scopeTeamByManager(members, managerId);
  const swapRequests = scopeTeamByManager(approvals, managerId).filter(
    (a) => a.category === 'Shift Swaps'
  );

  const shiftCounts: Record<ManagerShiftType, number> = {
    Morning: scopedMembers.filter((m) => m.shiftType === 'Morning').length,
    General: scopedMembers.filter((m) => m.shiftType === 'General').length,
    Night: scopedMembers.filter((m) => m.shiftType === 'Night').length,
    'Week Off': scopedMembers.filter((m) => m.shiftType === 'Week Off').length,
  };

  return (
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
              Active Team Shifts
            </Text>
            <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
              Shift distribution across {scopedMembers.length} direct reports
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Assign Shift Button"
            onPress={onOpenAssignShiftModal}
            style={[mgrSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
          >
            <CalendarClock size={15} color="#FFFFFF" />
            <Text style={mgrSharedStyles.primaryBtnText}>Assign Shift</Text>
          </Pressable>
        </View>

        <View style={styles.shiftSummaryGrid}>
          {(['Morning', 'General', 'Night'] as const).map((sh) => (
            <View
              key={sh}
              style={[
                styles.shiftBox,
                { backgroundColor: palette.inputBg, borderColor: palette.borderSubtle },
              ]}
            >
              <Text style={[styles.miniStatVal, { color: palette.primary }]}>
                {shiftCounts[sh]}
              </Text>
              <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
                {sh}
              </Text>
              <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted, fontSize: 10 }]}>
                {SHIFT_TIMINGS_MAP[sh]}
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
        <Text style={[mgrSharedStyles.sectionTitle, { color: palette.textPrimary, marginBottom: 8 }]}>
          Shift Swap Requests ({swapRequests.length})
        </Text>
        {swapRequests.length === 0 ? (
          <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
            No shift swap requests right now.
          </Text>
        ) : (
          swapRequests.map((req, idx) => {
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
                <View style={styles.memberRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
                      {req.employeeName} · {req.requestTitle}
                    </Text>
                    <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                      {req.dateRange} · {req.reason}
                    </Text>
                  </View>
                  <View style={[mgrSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                    <Text style={[mgrSharedStyles.statusBadgeText, { color: tone.text }]}>
                      {req.status}
                    </Text>
                  </View>
                </View>

                {req.status === 'Pending' ? (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                    <Pressable
                      accessibilityLabel={`Approve Swap ${req.id}`}
                      onPress={() => onApproveSwap(req.id)}
                      style={[
                        mgrSharedStyles.primaryBtn,
                        { flex: 1, backgroundColor: palette.emerald },
                      ]}
                    >
                      <Check size={14} color="#FFFFFF" />
                      <Text style={mgrSharedStyles.primaryBtnText}>Approve Swap</Text>
                    </Pressable>
                    <Pressable
                      accessibilityLabel={`Reject Swap ${req.id}`}
                      onPress={() => onOpenRejectSwap(req.id)}
                      style={[
                        mgrSharedStyles.secondaryBtn,
                        { flex: 1, backgroundColor: palette.roseBg, borderColor: palette.rose },
                      ]}
                    >
                      <X size={14} color={palette.rose} />
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
    </View>
  );
}

/* ============================================================================
 * 3. TEAM ROSTER VIEW (WEEKLY MATRIX WITH 1-TAP SHIFT CYCLE)
 * ========================================================================== */
interface ManagerTeamRosterViewProps {
  rosterRows: TeamRosterRow[];
  managerId: string;
  isDark: boolean;
  onAssignRosterCell: (
    employeeId: string,
    dayKey: RosterDayKey,
    shiftType: ManagerShiftType
  ) => void;
  onOpenAssignShiftModal: () => void;
}

const SHIFT_CYCLE: ManagerShiftType[] = ['Morning', 'General', 'Night', 'Week Off'];
const SHIFT_SHORT: Record<ManagerShiftType, string> = {
  Morning: 'MS',
  General: 'GS',
  Night: 'NS',
  'Week Off': 'OFF',
};

export function ManagerTeamRosterView({
  rosterRows,
  managerId,
  isDark,
  onAssignRosterCell,
  onOpenAssignShiftModal,
}: ManagerTeamRosterViewProps) {
  const palette = getPalette(isDark);
  const scopedRoster = scopeTeamByManager(rosterRows, managerId);

  return (
    <View style={mgrSharedStyles.stack}>
      <View
        style={[
          mgrSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={mgrSharedStyles.cardHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={[mgrSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
              Weekly Team Duty Roster
            </Text>
            <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
              Tap any day pill to cycle Morning (MS) → General (GS) → Night (NS) → Off
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Bulk Assign Roster"
            onPress={onOpenAssignShiftModal}
            style={[
              mgrSharedStyles.filterChip,
              { backgroundColor: palette.primaryLight, borderColor: palette.primary },
            ]}
          >
            <Text style={[mgrSharedStyles.filterChipText, { color: palette.primary }]}>
              + Assign
            </Text>
          </Pressable>
        </View>

        {scopedRoster.map((row, idx) => (
          <View
            key={row.employeeId}
            style={[
              mgrSharedStyles.listRow,
              idx > 0
                ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                : null,
            ]}
          >
            <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
              {row.employeeName}
            </Text>
            <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted, marginBottom: 8 }]}>
              {row.designation} · {row.employeeId}
            </Text>

            <View style={styles.rosterDayGrid}>
              {ROSTER_DAYS_OF_WEEK.map((day) => {
                const current = row.dayShifts[day];
                const isOff = current === 'Week Off';
                const nextShift =
                  SHIFT_CYCLE[(SHIFT_CYCLE.indexOf(current) + 1) % SHIFT_CYCLE.length];
                return (
                  <Pressable
                    key={day}
                    accessibilityLabel={`Roster ${row.employeeName} ${day} ${current}`}
                    onPress={() => onAssignRosterCell(row.employeeId, day, nextShift)}
                    style={[
                      styles.rosterCell,
                      {
                        backgroundColor: isOff ? palette.surfaceMuted : palette.primaryLight,
                        borderColor: isOff ? palette.border : palette.primary,
                      },
                    ]}
                  >
                    <Text style={[styles.rosterDayLbl, { color: palette.textMuted }]}>
                      {day}
                    </Text>
                    <Text
                      style={[
                        styles.rosterCodeLbl,
                        { color: isOff ? palette.textMuted : palette.primary },
                      ]}
                    >
                      {SHIFT_SHORT[current]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT_SANS,
    fontSize: 13,
  },
  filterScroll: {
    gap: 8,
    marginTop: 10,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  detailPanel: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statTripleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  miniStatBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
    gap: 2,
  },
  miniStatVal: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
    fontSize: 18,
    fontWeight: '700',
  },
  regBox: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  shiftSummaryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  shiftBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 2,
  },
  rosterDayGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  rosterCell: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 7,
    alignItems: 'center',
    gap: 2,
  },
  rosterDayLbl: {
    fontFamily: FONT_SANS,
    fontSize: 10,
    fontWeight: '600',
  },
  rosterCodeLbl: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    fontWeight: '700',
  },
});
