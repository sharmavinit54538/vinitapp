import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Download, Megaphone, ScanFace, X } from 'lucide-react';
import { getPalette } from '../../theme/colors';
import {
  ExecutiveAnnouncementItem,
  ExecutiveApprovalItem,
  ExecutiveBoardReportItem,
  ExecutivePortalState,
  ExecutiveProfileData,
  ExecutiveSelfServiceState,
  buildExecutiveCsvExport,
} from '@/lib/executive-portal-logic';
import { LeaveBalanceItem } from '@/lib/employee-portal-logic';
import { execSharedStyles } from './ExecutiveSharedStyles';

/* ============================================================================
 * 1. HOLD / ESCALATION NOTE MODAL
 * ========================================================================== */
interface HoldDecisionModalProps {
  visible: boolean;
  item: ExecutiveApprovalItem | null;
  isDark: boolean;
  onClose: () => void;
  onConfirmHold: (approvalId: string, note: string) => { valid: boolean; error?: string };
}

export function HoldDecisionModal(props: HoldDecisionModalProps) {
  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="slide"
      onRequestClose={props.onClose}
    >
      {props.visible ? (
        <HoldDecisionModalContent key={props.item?.id || 'hold'} {...props} />
      ) : null}
    </Modal>
  );
}

function HoldDecisionModalContent({
  item,
  isDark,
  onClose,
  onConfirmHold,
}: HoldDecisionModalProps) {
  const palette = getPalette(isDark);
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!item) return;
    const res = onConfirmHold(item.id, note);
    if (!res.valid) {
      setErrorMsg(res.error || 'Enter a brief executive hold note.');
      return;
    }
    onClose();
  };

  return (
    <View style={[execSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
      <View
        style={[
          execSharedStyles.modalSheet,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={execSharedStyles.dragHandleWrap}>
          <View style={[execSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
        </View>
        <View style={execSharedStyles.modalHeaderRow}>
          <Text style={[execSharedStyles.modalTitle, { color: palette.textPrimary }]}>
            Place Item on Hold
          </Text>
          <Pressable accessibilityLabel="Close Hold Modal" onPress={onClose}>
            <X size={20} color={palette.textMuted} />
          </Pressable>
        </View>

        {errorMsg ? (
          <View
            style={[
              execSharedStyles.errorBanner,
              { backgroundColor: palette.roseBg, borderColor: palette.rose },
            ]}
          >
            <Text style={[execSharedStyles.errorBannerText, { color: palette.rose }]}>
              {errorMsg}
            </Text>
          </View>
        ) : null}

        {item ? (
          <Text style={[execSharedStyles.metaText, { color: palette.textSecondary, marginBottom: 10 }]}>
            {item.referenceCode} · {item.title} ({item.amountLabel})
          </Text>
        ) : null}

        <Text style={[execSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
          Executive Hold Rationale / Follow-up Required
        </Text>
        <TextInput
          accessibilityLabel="Executive Hold Note Input"
          value={note}
          onChangeText={(t) => {
            setNote(t);
            if (errorMsg) setErrorMsg(null);
          }}
          placeholder="e.g. Confirm Q4 margin offset with CFO before release"
          placeholderTextColor={palette.textMuted}
          multiline
          style={[
            execSharedStyles.textArea,
            {
              backgroundColor: palette.inputBg,
              borderColor: palette.border,
              color: palette.textPrimary,
              marginBottom: 14,
            },
          ]}
        />

        <Pressable
          accessibilityLabel="Confirm Executive Hold Button"
          onPress={handleSubmit}
          style={[execSharedStyles.primaryBtn, { backgroundColor: palette.amber }]}
        >
          <Text style={execSharedStyles.primaryBtnText}>Confirm Hold Status</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ============================================================================
 * 2. BROADCAST COMPANY ANNOUNCEMENT MODAL
 * ========================================================================== */
interface BroadcastAnnouncementModalProps {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
  onPublish: (payload: {
    title: string;
    body: string;
    audience: ExecutiveAnnouncementItem['audience'];
    priority: ExecutiveAnnouncementItem['priority'];
  }) => { valid: boolean; error?: string };
}

export function BroadcastAnnouncementModal(props: BroadcastAnnouncementModalProps) {
  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="slide"
      onRequestClose={props.onClose}
    >
      {props.visible ? <BroadcastAnnouncementModalContent {...props} /> : null}
    </Modal>
  );
}

function BroadcastAnnouncementModalContent({
  isDark,
  onClose,
  onPublish,
}: BroadcastAnnouncementModalProps) {
  const palette = getPalette(isDark);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<ExecutiveAnnouncementItem['audience']>('All Employees');
  const [priority, setPriority] = useState<ExecutiveAnnouncementItem['priority']>('Town Hall');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePublish = () => {
    const res = onPublish({ title, body, audience, priority });
    if (!res.valid) {
      setErrorMsg(res.error || 'Enter announcement headline and message.');
      return;
    }
    onClose();
  };

  return (
    <View style={[execSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
      <View
        style={[
          execSharedStyles.modalSheet,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={execSharedStyles.dragHandleWrap}>
          <View style={[execSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
        </View>
        <View style={execSharedStyles.modalHeaderRow}>
          <Text style={[execSharedStyles.modalTitle, { color: palette.textPrimary }]}>
            Broadcast Company Notice
          </Text>
          <Pressable accessibilityLabel="Close Broadcast Modal" onPress={onClose}>
            <X size={20} color={palette.textMuted} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {errorMsg ? (
            <View
              style={[
                execSharedStyles.errorBanner,
                { backgroundColor: palette.roseBg, borderColor: palette.rose },
              ]}
            >
              <Text style={[execSharedStyles.errorBannerText, { color: palette.rose }]}>
                {errorMsg}
              </Text>
            </View>
          ) : null}

          <Text style={[execSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
            Announcement Title
          </Text>
          <TextInput
            accessibilityLabel="Announcement Title Input"
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="e.g. FY27 Strategic Growth & ESOP Update"
            placeholderTextColor={palette.textMuted}
            style={[
              execSharedStyles.input,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.border,
                color: palette.textPrimary,
                marginBottom: 10,
              },
            ]}
          />

          <Text style={[execSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
            Target Audience
          </Text>
          <View style={[execSharedStyles.chipRow, { marginBottom: 10 }]}>
            {(['All Employees', 'People Managers', 'Engineering & Product'] as const).map(
              (aud) => {
                const active = audience === aud;
                return (
                  <Pressable
                    key={aud}
                    accessibilityLabel={`Audience ${aud}`}
                    onPress={() => setAudience(aud)}
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
                      {aud}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>

          <Text style={[execSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
            Priority Tag
          </Text>
          <View style={[execSharedStyles.chipRow, { marginBottom: 10 }]}>
            {(['Town Hall', 'Important', 'Standard'] as const).map((pri) => {
              const active = priority === pri;
              return (
                <Pressable
                  key={pri}
                  accessibilityLabel={`Priority ${pri}`}
                  onPress={() => setPriority(pri)}
                  style={[
                    execSharedStyles.filterChip,
                    {
                      backgroundColor: active ? palette.amberBg : palette.inputBg,
                      borderColor: active ? palette.amber : palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      execSharedStyles.filterChipText,
                      { color: active ? palette.amber : palette.textSecondary },
                    ]}
                  >
                    {pri}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[execSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
            Executive Message
          </Text>
          <TextInput
            accessibilityLabel="Announcement Body Input"
            value={body}
            onChangeText={(t) => {
              setBody(t);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="Write the company-wide broadcast details..."
            placeholderTextColor={palette.textMuted}
            multiline
            style={[
              execSharedStyles.textArea,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.border,
                color: palette.textPrimary,
                marginBottom: 14,
              },
            ]}
          />

          <Pressable
            accessibilityLabel="Publish Announcement Button"
            onPress={handlePublish}
            style={[execSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
          >
            <Megaphone size={15} color="#FFFFFF" />
            <Text style={execSharedStyles.primaryBtnText}>Publish Announcement</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

/* ============================================================================
 * 3. BOARD PACK & CSV REPORT PREVIEW / DOWNLOAD MODAL
 * ========================================================================== */
interface BoardPackPreviewModalProps {
  visible: boolean;
  report: ExecutiveBoardReportItem | null;
  state: ExecutivePortalState;
  isDark: boolean;
  onClose: () => void;
  onDownloadComplete: (filename: string) => void;
}

export function BoardPackPreviewModal(props: BoardPackPreviewModalProps) {
  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="slide"
      onRequestClose={props.onClose}
    >
      {props.visible && props.report ? (
        <BoardPackPreviewModalContent key={props.report.id} {...props} />
      ) : null}
    </Modal>
  );
}

function BoardPackPreviewModalContent({
  report,
  state,
  isDark,
  onClose,
  onDownloadComplete,
}: BoardPackPreviewModalProps) {
  const palette = getPalette(isDark);
  const exported = useMemo(
    () => buildExecutiveCsvExport(report?.id || 'board_pack', state),
    [report?.id, state]
  );

  const handleDownloadCsv = () => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        const blob = new Blob([exported.csvContent], {
          type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = exported.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {
        // Fallback silently in non-browser tests
      }
    }
    onDownloadComplete(exported.filename);
    onClose();
  };

  return (
    <View style={[execSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
      <View
        style={[
          execSharedStyles.modalSheet,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={execSharedStyles.dragHandleWrap}>
          <View style={[execSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
        </View>
        <View style={execSharedStyles.modalHeaderRow}>
          <Text style={[execSharedStyles.modalTitle, { color: palette.textPrimary }]}>
            Export Executive Pack
          </Text>
          <Pressable accessibilityLabel="Close Export Modal" onPress={onClose}>
            <X size={20} color={palette.textMuted} />
          </Pressable>
        </View>

        <Text style={[execSharedStyles.subTitle, { color: palette.textPrimary }]}>
          {report?.title}
        </Text>
        <Text
          style={[
            execSharedStyles.metaText,
            execSharedStyles.monoText,
            { color: palette.textMuted, marginTop: 2, marginBottom: 10 },
          ]}
        >
          {exported.filename} · {exported.rowCount} data rows
        </Text>

        <ScrollView
          style={[
            styles.csvPreviewBox,
            { backgroundColor: palette.inputBg, borderColor: palette.border },
          ]}
        >
          <Text
            style={[
              execSharedStyles.metaText,
              execSharedStyles.monoText,
              { color: palette.textSecondary, fontSize: 11 },
            ]}
          >
            {exported.csvContent}
          </Text>
        </ScrollView>

        <Pressable
          accessibilityLabel="Download CSV Pack Button"
          onPress={handleDownloadCsv}
          style={[
            execSharedStyles.primaryBtn,
            { backgroundColor: palette.primary, marginTop: 14 },
          ]}
        >
          <Download size={15} color="#FFFFFF" />
          <Text style={execSharedStyles.primaryBtnText}>Download CSV Pack</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ============================================================================
 * 4. EXECUTIVE SELF CHECK-IN & APPLY LEAVE MODALS
 * ========================================================================== */
interface ExecSelfCheckInModalProps {
  visible: boolean;
  isDark: boolean;
  profile: ExecutiveProfileData;
  selfService: ExecutiveSelfServiceState;
  onClose: () => void;
  onSubmitPunch: (nextStatus: 'Checked In' | 'Not Checked In') => void;
}

export function ExecSelfCheckInModal({
  visible,
  isDark,
  profile,
  selfService,
  onClose,
  onSubmitPunch,
}: ExecSelfCheckInModalProps) {
  const palette = getPalette(isDark);
  const nextStatus =
    selfService.todayStatus === 'Checked In' ? 'Not Checked In' : 'Checked In';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[execSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
        <View
          style={[
            execSharedStyles.modalSheet,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={execSharedStyles.dragHandleWrap}>
            <View style={[execSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
          </View>
          <View style={execSharedStyles.modalHeaderRow}>
            <Text style={[execSharedStyles.modalTitle, { color: palette.textPrimary }]}>
              Executive Attendance Punch
            </Text>
            <Pressable accessibilityLabel="Close Self Check-In Modal" onPress={onClose}>
              <X size={20} color={palette.textMuted} />
            </Pressable>
          </View>

          <View
            style={[
              styles.bioCard,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <ScanFace size={34} color={palette.primary} />
            <Text style={[execSharedStyles.subTitle, { color: palette.textPrimary, marginTop: 8 }]}>
              {profile.fullName} · {profile.executiveId}
            </Text>
            <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
              Current: {selfService.todayStatus} ({selfService.punchInTime})
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Confirm Executive Self Punch"
            onPress={() => {
              onSubmitPunch(nextStatus);
              onClose();
            }}
            style={[
              execSharedStyles.primaryBtn,
              { backgroundColor: palette.primary, marginTop: 14 },
            ]}
          >
            <Text style={execSharedStyles.primaryBtnText}>
              {nextStatus === 'Checked In' ? 'Confirm Check In' : 'Confirm Check Out'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

interface ExecSelfApplyLeaveModalProps {
  visible: boolean;
  isDark: boolean;
  balances: LeaveBalanceItem[];
  onClose: () => void;
  onSubmitLeave: (payload: {
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) => { valid: boolean; error?: string };
}

export function ExecSelfApplyLeaveModal(props: ExecSelfApplyLeaveModalProps) {
  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="slide"
      onRequestClose={props.onClose}
    >
      {props.visible ? <ExecSelfApplyLeaveModalContent {...props} /> : null}
    </Modal>
  );
}

function ExecSelfApplyLeaveModalContent({
  isDark,
  balances,
  onClose,
  onSubmitLeave,
}: ExecSelfApplyLeaveModalProps) {
  const palette = getPalette(isDark);
  const [leaveType, setLeaveType] = useState(balances[0]?.label || 'Privilege Leave');
  const [startDate, setStartDate] = useState('2026-11-24');
  const [endDate, setEndDate] = useState('2026-11-25');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = () => {
    const res = onSubmitLeave({ leaveType, startDate, endDate, reason });
    if (!res.valid) {
      setErrorMsg(res.error || 'Enter leave dates and reason.');
      return;
    }
    onClose();
  };

  return (
    <View style={[execSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
      <View
        style={[
          execSharedStyles.modalSheet,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={execSharedStyles.dragHandleWrap}>
          <View style={[execSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
        </View>
        <View style={execSharedStyles.modalHeaderRow}>
          <Text style={[execSharedStyles.modalTitle, { color: palette.textPrimary }]}>
            Apply Personal Leave
          </Text>
          <Pressable accessibilityLabel="Close Self Leave Modal" onPress={onClose}>
            <X size={20} color={palette.textMuted} />
          </Pressable>
        </View>

        {errorMsg ? (
          <View
            style={[
              execSharedStyles.errorBanner,
              { backgroundColor: palette.roseBg, borderColor: palette.rose },
            ]}
          >
            <Text style={[execSharedStyles.errorBannerText, { color: palette.rose }]}>
              {errorMsg}
            </Text>
          </View>
        ) : null}

        <View style={[execSharedStyles.chipRow, { marginBottom: 10 }]}>
          {balances.map((b) => {
            const active = leaveType === b.label;
            return (
              <Pressable
                key={b.key}
                onPress={() => setLeaveType(b.label)}
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
                  {b.label} ({b.remaining})
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.dateRow}>
          <View style={{ flex: 1 }}>
            <Text style={[execSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Start Date
            </Text>
            <TextInput
              value={startDate}
              onChangeText={setStartDate}
              style={[
                execSharedStyles.input,
                execSharedStyles.monoText,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                },
              ]}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[execSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              End Date
            </Text>
            <TextInput
              value={endDate}
              onChangeText={setEndDate}
              style={[
                execSharedStyles.input,
                execSharedStyles.monoText,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                },
              ]}
            />
          </View>
        </View>

        <Text style={[execSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 10 }]}>
          Reason
        </Text>
        <TextInput
          accessibilityLabel="Executive Leave Reason Input"
          value={reason}
          onChangeText={setReason}
          placeholder="Out of office / board summit..."
          placeholderTextColor={palette.textMuted}
          style={[
            execSharedStyles.input,
            {
              backgroundColor: palette.inputBg,
              borderColor: palette.border,
              color: palette.textPrimary,
              marginBottom: 14,
            },
          ]}
        />

        <Pressable
          accessibilityLabel="Submit Executive Self Leave"
          onPress={handleSubmit}
          style={[execSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
        >
          <Text style={execSharedStyles.primaryBtnText}>Submit Leave</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  csvPreviewBox: {
    maxHeight: 190,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  bioCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
