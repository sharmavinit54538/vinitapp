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
  Camera,
  CheckCircle2,
  MapPin,
  ScanFace,
  ShieldCheck,
  X,
} from 'lucide-react';
import { FONT_MONO, FONT_SANS, getPalette } from '../../theme/colors';
import {
  ManagerApprovalItem,
  ManagerProfileData,
  ManagerSelfServiceState,
  ManagerShiftType,
  ROSTER_DAYS_OF_WEEK,
  RosterDayKey,
  SHIFT_TIMINGS_MAP,
  TeamMember,
  validateHiringRequisitionInput,
} from '@/lib/manager-portal-logic';
import { LeaveBalanceItem } from '@/lib/employee-portal-logic';
import { mgrSharedStyles } from './ManagerSharedStyles';

/* ============================================================================
 * 1. REJECT APPROVAL MODAL (MANDATORY REMARK)
 * ========================================================================== */
interface RejectApprovalModalProps {
  visible: boolean;
  approvalItem: ManagerApprovalItem | null;
  isDark: boolean;
  onClose: () => void;
  onConfirmReject: (
    approvalId: string,
    remark: string
  ) => { valid: boolean; error?: string };
}

export function RejectApprovalModal({
  visible,
  approvalItem,
  isDark,
  onClose,
  onConfirmReject,
}: RejectApprovalModalProps) {
  const palette = getPalette(isDark);
  const [remark, setRemark] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClose = () => {
    setRemark('');
    setErrorMsg(null);
    onClose();
  };

  const handleSubmit = () => {
    if (!approvalItem) return;
    const res = onConfirmReject(approvalItem.id, remark);
    if (!res.valid) {
      setErrorMsg(
        res.error || 'Please provide a rejection remark (min 4 characters).'
      );
      return;
    }
    setRemark('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
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
          <View style={mgrSharedStyles.modalHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={[mgrSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                Reject Team Request
              </Text>
              {approvalItem ? (
                <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                  {approvalItem.employeeName} · {approvalItem.requestTitle}
                </Text>
              ) : null}
            </View>
            <Pressable accessibilityLabel="Close Reject Modal" onPress={handleClose}>
              <X size={20} color={palette.textMuted} />
            </Pressable>
          </View>

          {errorMsg ? (
            <View
              style={[
                mgrSharedStyles.errorBanner,
                { backgroundColor: palette.roseBg, borderColor: palette.rose },
              ]}
            >
              <Text style={[mgrSharedStyles.errorBannerText, { color: palette.rose }]}>
                {errorMsg}
              </Text>
            </View>
          ) : null}

          <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
            Rejection Remark (sent to employee)
          </Text>
          <TextInput
            accessibilityLabel="Rejection Remark Input"
            value={remark}
            onChangeText={(txt) => {
              setRemark(txt);
              setErrorMsg(null);
            }}
            multiline
            placeholder="Explain reason or suggest alternate dates/shift..."
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

          <View style={styles.btnRow}>
            <Pressable
              accessibilityLabel="Cancel Rejection"
              onPress={handleClose}
              style={[
                mgrSharedStyles.secondaryBtn,
                { flex: 1, backgroundColor: palette.inputBg, borderColor: palette.border },
              ]}
            >
              <Text style={[mgrSharedStyles.secondaryBtnText, { color: palette.textSecondary }]}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Confirm Rejection"
              onPress={handleSubmit}
              style={[
                mgrSharedStyles.primaryBtn,
                { flex: 1, backgroundColor: palette.rose },
              ]}
            >
              <Text style={mgrSharedStyles.primaryBtnText}>Confirm Reject</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================================
 * 2. ASSIGN SHIFT / ROSTER MODAL
 * ========================================================================== */
interface AssignRosterModalProps {
  visible: boolean;
  members: TeamMember[];
  isDark: boolean;
  onClose: () => void;
  onConfirmAssign: (payload: {
    employeeId: string;
    dayScope: RosterDayKey | 'Weekdays';
    shiftType: ManagerShiftType;
  }) => void;
}

const SHIFT_OPTIONS: ManagerShiftType[] = ['Morning', 'General', 'Night', 'Week Off'];

export function AssignRosterModal({
  visible,
  members,
  isDark,
  onClose,
  onConfirmAssign,
}: AssignRosterModalProps) {
  const palette = getPalette(isDark);
  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    members[0]?.employeeId || 'EMP-2048'
  );
  const [dayScope, setDayScope] = useState<RosterDayKey | 'Weekdays'>('Weekdays');
  const [shiftType, setShiftType] = useState<ManagerShiftType>('General');

  const activeEmpId = members.some((m) => m.employeeId === selectedEmpId)
    ? selectedEmpId
    : members[0]?.employeeId || 'EMP-2048';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
          <View style={mgrSharedStyles.modalHeaderRow}>
            <View>
              <Text style={[mgrSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                Assign Team Shift / Roster
              </Text>
              <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                Updates active shift assignment &amp; weekly duty matrix
              </Text>
            </View>
            <Pressable accessibilityLabel="Close Assign Roster Modal" onPress={onClose}>
              <X size={20} color={palette.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Select Direct Report
            </Text>
            <View style={[mgrSharedStyles.chipRow, { marginBottom: 12 }]}>
              {members.slice(0, 6).map((m) => {
                const active = activeEmpId === m.employeeId;
                return (
                  <Pressable
                    key={m.employeeId}
                    accessibilityLabel={`Select Teammate ${m.fullName}`}
                    onPress={() => setSelectedEmpId(m.employeeId)}
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
                      {m.fullName.split(' ')[0]} ({m.initials})
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Day Scope
            </Text>
            <View style={[mgrSharedStyles.chipRow, { marginBottom: 12 }]}>
              <Pressable
                accessibilityLabel="Roster Scope Full Week Mon-Fri"
                onPress={() => setDayScope('Weekdays')}
                style={[
                  mgrSharedStyles.filterChip,
                  {
                    backgroundColor:
                      dayScope === 'Weekdays' ? palette.primaryLight : palette.inputBg,
                    borderColor: dayScope === 'Weekdays' ? palette.primary : palette.border,
                  },
                ]}
              >
                <Text
                  style={[
                    mgrSharedStyles.filterChipText,
                    { color: dayScope === 'Weekdays' ? palette.primary : palette.textSecondary },
                  ]}
                >
                  Mon–Fri
                </Text>
              </Pressable>
              {ROSTER_DAYS_OF_WEEK.map((day) => {
                const active = dayScope === day;
                return (
                  <Pressable
                    key={day}
                    accessibilityLabel={`Roster Scope ${day}`}
                    onPress={() => setDayScope(day)}
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
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Target Shift
            </Text>
            <View style={{ gap: 8, marginBottom: 16 }}>
              {SHIFT_OPTIONS.map((sh) => {
                const active = shiftType === sh;
                return (
                  <Pressable
                    key={sh}
                    accessibilityLabel={`Select Shift ${sh}`}
                    onPress={() => setShiftType(sh)}
                    style={[
                      styles.shiftOptionRow,
                      {
                        backgroundColor: active ? palette.primaryLight : palette.inputBg,
                        borderColor: active ? palette.primary : palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        mgrSharedStyles.subTitle,
                        { color: active ? palette.primary : palette.textPrimary },
                      ]}
                    >
                      {sh}
                    </Text>
                    <Text
                      style={[
                        mgrSharedStyles.metaText,
                        mgrSharedStyles.monoText,
                        { color: active ? palette.primary : palette.textMuted },
                      ]}
                    >
                      {SHIFT_TIMINGS_MAP[sh]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              accessibilityLabel="Apply Shift Assignment"
              onPress={() => {
                onConfirmAssign({
                  employeeId: activeEmpId,
                  dayScope,
                  shiftType,
                });
                onClose();
              }}
              style={[mgrSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
            >
              <Text style={mgrSharedStyles.primaryBtnText}>Save Shift Assignment</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================================
 * 3. RAISE HIRING REQUISITION MODAL
 * ========================================================================== */
interface RaiseRequisitionModalProps {
  visible: boolean;
  departmentName: string;
  isDark: boolean;
  onClose: () => void;
  onConfirmRequisition: (payload: {
    title: string;
    headcount: number;
    priority: 'Critical' | 'High' | 'Standard';
    hiringMode: 'Full-Time' | 'Contract';
  }) => void;
}

export function RaiseRequisitionModal({
  visible,
  departmentName,
  isDark,
  onClose,
  onConfirmRequisition,
}: RaiseRequisitionModalProps) {
  const palette = getPalette(isDark);
  const [title, setTitle] = useState('');
  const [headcountText, setHeadcountText] = useState('1');
  const [priority, setPriority] = useState<'Critical' | 'High' | 'Standard'>('High');
  const [hiringMode, setHiringMode] = useState<'Full-Time' | 'Contract'>('Full-Time');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = () => {
    const parsedCount = Number(headcountText);
    const check = validateHiringRequisitionInput({
      title,
      headcount: parsedCount,
    });
    if (!check.valid) {
      setErrorMsg(check.error || 'Please verify role title and headcount.');
      return;
    }
    onConfirmRequisition({
      title: title.trim(),
      headcount: Math.floor(parsedCount),
      priority,
      hiringMode,
    });
    setTitle('');
    setHeadcountText('1');
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
          <View style={mgrSharedStyles.modalHeaderRow}>
            <View>
              <Text style={[mgrSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                Raise Hiring Requisition
              </Text>
              <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                Department: {departmentName}
              </Text>
            </View>
            <Pressable accessibilityLabel="Close Requisition Modal" onPress={onClose}>
              <X size={20} color={palette.textMuted} />
            </Pressable>
          </View>

          {errorMsg ? (
            <View
              style={[
                mgrSharedStyles.errorBanner,
                { backgroundColor: palette.roseBg, borderColor: palette.rose },
              ]}
            >
              <Text style={[mgrSharedStyles.errorBannerText, { color: palette.rose }]}>
                {errorMsg}
              </Text>
            </View>
          ) : null}

          <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
            Role Title
          </Text>
          <TextInput
            accessibilityLabel="Requisition Role Title"
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              setErrorMsg(null);
            }}
            placeholder="e.g. Senior Backend Engineer (Payments)"
            placeholderTextColor={palette.textMuted}
            style={[
              mgrSharedStyles.input,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.border,
                color: palette.textPrimary,
                marginBottom: 12,
              },
            ]}
          />

          <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
            Headcount Needed (1–20)
          </Text>
          <TextInput
            accessibilityLabel="Requisition Headcount"
            value={headcountText}
            onChangeText={(t) => {
              setHeadcountText(t);
              setErrorMsg(null);
            }}
            keyboardType="numeric"
            style={[
              mgrSharedStyles.input,
              mgrSharedStyles.monoText,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.border,
                color: palette.textPrimary,
                marginBottom: 12,
              },
            ]}
          />

          <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
            Priority Level
          </Text>
          <View style={[mgrSharedStyles.chipRow, { marginBottom: 12 }]}>
            {(['Critical', 'High', 'Standard'] as const).map((p) => {
              const active = priority === p;
              return (
                <Pressable
                  key={p}
                  accessibilityLabel={`Priority ${p}`}
                  onPress={() => setPriority(p)}
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
                    {p}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
            Engagement Type
          </Text>
          <View style={[mgrSharedStyles.chipRow, { marginBottom: 16 }]}>
            {(['Full-Time', 'Contract'] as const).map((mode) => {
              const active = hiringMode === mode;
              return (
                <Pressable
                  key={mode}
                  accessibilityLabel={`Hiring Mode ${mode}`}
                  onPress={() => setHiringMode(mode)}
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
                    {mode}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityLabel="Submit Hiring Requisition"
            onPress={handleSubmit}
            style={[mgrSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
          >
            <Text style={mgrSharedStyles.primaryBtnText}>Submit Requisition to Talent Ops</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================================
 * 4. BROADCAST TEAM NOTICE MODAL
 * ========================================================================== */
type NoticeCategory = 'Company News' | 'Policy Update' | 'IT & Security' | 'Events';

interface BroadcastTeamNoticeModalProps {
  visible: boolean;
  departmentName: string;
  isDark: boolean;
  onClose: () => void;
  onConfirmBroadcast: (payload: {
    title: string;
    category: NoticeCategory;
    priority: 'High' | 'Normal';
    description: string;
  }) => void;
}

export function BroadcastTeamNoticeModal({
  visible,
  departmentName,
  isDark,
  onClose,
  onConfirmBroadcast,
}: BroadcastTeamNoticeModalProps) {
  const palette = getPalette(isDark);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('Company News');
  const [priority, setPriority] = useState<'High' | 'Normal'>('Normal');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = () => {
    if (title.trim().length < 4) {
      setErrorMsg('Enter a notice title (min 4 characters).');
      return;
    }
    if (description.trim().length < 8) {
      setErrorMsg('Enter team notice details (min 8 characters).');
      return;
    }
    onConfirmBroadcast({
      title: title.trim(),
      category,
      priority,
      description: description.trim(),
    });
    setTitle('');
    setDescription('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
          <View style={mgrSharedStyles.modalHeaderRow}>
            <View>
              <Text style={[mgrSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                Broadcast Team Notice
              </Text>
              <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                Visible to all direct reports in {departmentName}
              </Text>
            </View>
            <Pressable accessibilityLabel="Close Broadcast Modal" onPress={onClose}>
              <X size={20} color={palette.textMuted} />
            </Pressable>
          </View>

          {errorMsg ? (
            <View
              style={[
                mgrSharedStyles.errorBanner,
                { backgroundColor: palette.roseBg, borderColor: palette.rose },
              ]}
            >
              <Text style={[mgrSharedStyles.errorBannerText, { color: palette.rose }]}>
                {errorMsg}
              </Text>
            </View>
          ) : null}

          <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
            Notice Headline
          </Text>
          <TextInput
            accessibilityLabel="Team Notice Headline"
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              setErrorMsg(null);
            }}
            placeholder="e.g. Sprint 24 Release Freeze Schedule"
            placeholderTextColor={palette.textMuted}
            style={[
              mgrSharedStyles.input,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.border,
                color: palette.textPrimary,
                marginBottom: 12,
              },
            ]}
          />

          <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
            Category &amp; Priority
          </Text>
          <View style={[mgrSharedStyles.chipRow, { marginBottom: 12 }]}>
            {(['Company News', 'Policy Update', 'Events'] as const).map((c) => {
              const active = category === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => setCategory(c)}
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
                    {c}
                  </Text>
                </Pressable>
              );
            })}
            {(['Normal', 'High'] as const).map((p) => {
              const active = priority === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => setPriority(p)}
                  style={[
                    mgrSharedStyles.filterChip,
                    {
                      backgroundColor: active ? palette.amberBg : palette.inputBg,
                      borderColor: active ? palette.amber : palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      mgrSharedStyles.filterChipText,
                      { color: active ? palette.amber : palette.textSecondary },
                    ]}
                  >
                    {p}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
            Notice Message
          </Text>
          <TextInput
            accessibilityLabel="Team Notice Message"
            value={description}
            onChangeText={(t) => {
              setDescription(t);
              setErrorMsg(null);
            }}
            multiline
            placeholder="Share shift instructions, deployment windows, or standup updates..."
            placeholderTextColor={palette.textMuted}
            style={[
              mgrSharedStyles.textArea,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.border,
                color: palette.textPrimary,
                marginBottom: 14,
              },
            ]}
          />

          <Pressable
            accessibilityLabel="Publish Team Notice"
            onPress={handleSubmit}
            style={[mgrSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
          >
            <Text style={mgrSharedStyles.primaryBtnText}>Publish to Team Feed</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================================
 * 5. MANAGER SELF-SERVICE FACE CHECK-IN / CHECK-OUT MODAL
 * ========================================================================== */
interface ManagerFaceCheckInModalProps {
  visible: boolean;
  isDark: boolean;
  profile: ManagerProfileData;
  selfService: ManagerSelfServiceState;
  onClose: () => void;
  onSubmitPunch: (payload: {
    action: 'Check-In' | 'Check-Out';
    workMode: 'Office' | 'WFH';
  }) => void;
}

export function ManagerFaceCheckInModal({
  visible,
  isDark,
  profile,
  selfService,
  onClose,
  onSubmitPunch,
}: ManagerFaceCheckInModalProps) {
  const palette = getPalette(isDark);
  const actionLabel: 'Check-In' | 'Check-Out' =
    selfService.todayStatus === 'Checked In' ? 'Check-Out' : 'Check-In';
  const [workMode, setWorkMode] = useState<'Office' | 'WFH'>(
    selfService.workMode || 'Office'
  );
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!selfieCaptured) {
      setErrorMsg('Capture biometric face verification first.');
      return;
    }
    onSubmitPunch({ action: actionLabel, workMode });
    setSelfieCaptured(false);
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
          <View style={mgrSharedStyles.modalHeaderRow}>
            <View>
              <Text style={[mgrSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                Self {actionLabel}
              </Text>
              <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted }]}>
                {profile.fullName} · {profile.managerId}
              </Text>
            </View>
            <Pressable accessibilityLabel="Close Self Check-In Modal" onPress={onClose}>
              <X size={20} color={palette.textMuted} />
            </Pressable>
          </View>

          {errorMsg ? (
            <View
              style={[
                mgrSharedStyles.errorBanner,
                { backgroundColor: palette.roseBg, borderColor: palette.rose },
              ]}
            >
              <Text style={[mgrSharedStyles.errorBannerText, { color: palette.rose }]}>
                {errorMsg}
              </Text>
            </View>
          ) : null}

          <View
            style={[
              styles.faceBox,
              {
                backgroundColor: selfieCaptured ? palette.emeraldBg : palette.inputBg,
                borderColor: selfieCaptured ? palette.emerald : palette.border,
              },
            ]}
          >
            {selfieCaptured ? (
              <CheckCircle2 size={32} color={palette.emerald} />
            ) : (
              <ScanFace size={32} color={palette.primary} />
            )}
            <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
              {selfieCaptured ? 'Biometric Liveness Verified (99.4%)' : 'Ready for Face Scan'}
            </Text>
            <Pressable
              accessibilityLabel="Capture Manager Selfie"
              onPress={() => {
                setSelfieCaptured(true);
                setErrorMsg(null);
              }}
              style={[mgrSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
            >
              <Camera size={15} color="#FFFFFF" />
              <Text style={mgrSharedStyles.primaryBtnText}>
                {selfieCaptured ? 'Re-verify Face' : 'Capture Face Verification'}
              </Text>
            </Pressable>
          </View>

          <View style={[styles.geoRow, { backgroundColor: palette.inputBg, borderColor: palette.border }]}>
            <MapPin size={15} color={palette.emerald} />
            <Text style={[mgrSharedStyles.metaText, { color: palette.textPrimary, flex: 1 }]}>
              {workMode === 'Office' ? profile.location : 'Remote Home Office · Verified GPS'}
            </Text>
            <ShieldCheck size={15} color={palette.emerald} />
          </View>

          <View style={[mgrSharedStyles.chipRow, { marginBottom: 14 }]}>
            {(['Office', 'WFH'] as const).map((m) => {
              const active = workMode === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => setWorkMode(m)}
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
                    {m}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityLabel={`Confirm Manager ${actionLabel}`}
            onPress={handleConfirm}
            style={[mgrSharedStyles.primaryBtn, { backgroundColor: palette.emerald }]}
          >
            <Text style={mgrSharedStyles.primaryBtnText}>Confirm {actionLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================================
 * 6. MANAGER PERSONAL APPLY LEAVE MODAL
 * ========================================================================== */
interface ManagerApplyLeaveModalProps {
  visible: boolean;
  isDark: boolean;
  balances: LeaveBalanceItem[];
  onClose: () => void;
  onSubmitLeave: (payload: {
    leaveKey: string;
    leaveType: string;
    fromDate: string;
    toDate: string;
    days: number;
    reason: string;
  }) => void;
}

export function ManagerApplyLeaveModal({
  visible,
  isDark,
  balances,
  onClose,
  onSubmitLeave,
}: ManagerApplyLeaveModalProps) {
  const palette = getPalette(isDark);
  const [selectedKey, setSelectedKey] = useState<string>(balances[0]?.key || 'earned');
  const [fromDate, setFromDate] = useState('2026-11-26');
  const [toDate, setToDate] = useState('2026-11-26');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedBalance =
    balances.find((b) => b.key === selectedKey) || balances[0];

  const handleSubmit = () => {
    if (reason.trim().length < 5) {
      setErrorMsg('Enter a leave reason (min 5 characters).');
      return;
    }
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      setErrorMsg('Select valid From and To dates.');
      return;
    }
    const days = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / (24 * 3600 * 1000)) + 1
    );
    if (selectedBalance && days > selectedBalance.remaining) {
      setErrorMsg(
        `Insufficient ${selectedBalance.label} balance (${selectedBalance.remaining}d left).`
      );
      return;
    }
    onSubmitLeave({
      leaveKey: selectedBalance?.key || 'earned',
      leaveType: selectedBalance?.label || 'Earned Leave',
      fromDate,
      toDate,
      days,
      reason: reason.trim(),
    });
    setReason('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
          <View style={mgrSharedStyles.modalHeaderRow}>
            <Text style={[mgrSharedStyles.modalTitle, { color: palette.textPrimary }]}>
              Apply Personal Leave
            </Text>
            <Pressable accessibilityLabel="Close Manager Leave Modal" onPress={onClose}>
              <X size={20} color={palette.textMuted} />
            </Pressable>
          </View>

          {errorMsg ? (
            <View
              style={[
                mgrSharedStyles.errorBanner,
                { backgroundColor: palette.roseBg, borderColor: palette.rose },
              ]}
            >
              <Text style={[mgrSharedStyles.errorBannerText, { color: palette.rose }]}>
                {errorMsg}
              </Text>
            </View>
          ) : null}

          <View style={[mgrSharedStyles.chipRow, { marginBottom: 12 }]}>
            {balances.map((b) => {
              const active = b.key === selectedKey;
              return (
                <Pressable
                  key={b.key}
                  onPress={() => setSelectedKey(b.key)}
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
                    {b.code} ({b.remaining}d)
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                From Date
              </Text>
              <TextInput
                accessibilityLabel="Manager Leave From Date"
                value={fromDate}
                onChangeText={setFromDate}
                style={[
                  mgrSharedStyles.input,
                  mgrSharedStyles.monoText,
                  { backgroundColor: palette.inputBg, borderColor: palette.border, color: palette.textPrimary },
                ]}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                To Date
              </Text>
              <TextInput
                accessibilityLabel="Manager Leave To Date"
                value={toDate}
                onChangeText={setToDate}
                style={[
                  mgrSharedStyles.input,
                  mgrSharedStyles.monoText,
                  { backgroundColor: palette.inputBg, borderColor: palette.border, color: palette.textPrimary },
                ]}
              />
            </View>
          </View>

          <Text style={[mgrSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
            Reason
          </Text>
          <TextInput
            accessibilityLabel="Manager Leave Reason"
            value={reason}
            onChangeText={(t) => {
              setReason(t);
              setErrorMsg(null);
            }}
            multiline
            placeholder="Delegation backup & leave notes..."
            placeholderTextColor={palette.textMuted}
            style={[
              mgrSharedStyles.textArea,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.border,
                color: palette.textPrimary,
                marginBottom: 14,
              },
            ]}
          />

          <Pressable
            accessibilityLabel="Submit Manager Personal Leave"
            onPress={handleSubmit}
            style={[mgrSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
          >
            <Text style={mgrSharedStyles.primaryBtnText}>Submit Personal Leave</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  shiftOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  faceBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  geoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
});
