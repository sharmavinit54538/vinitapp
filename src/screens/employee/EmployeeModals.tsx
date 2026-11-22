import React, { useState, useMemo } from 'react';
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
  Paperclip,
  ScanFace,
  ShieldCheck,
  X,
} from 'lucide-react';
import { FONT_MONO, FONT_SANS, getPalette } from '../../theme/colors';
import {
  EmployeeExpenseClaim,
  EmployeeHelpdeskTicket,
  EmployeeProfileData,
  LeaveBalanceItem,
  LeaveCategoryKey,
  TodayAttendanceSession,
  UnifiedEmployeeRequestItem,
  validateLeaveApplication,
} from '@/lib/employee-portal-logic';
import { empSharedStyles, getStatusTone } from './EmployeeSharedStyles';

/* ============================================================================
 * 1. BIOMETRIC FACE & GEOFENCE CHECK-IN / CHECK-OUT MODAL
 * ========================================================================== */
interface FaceCheckInModalProps {
  visible: boolean;
  isDark: boolean;
  profile: EmployeeProfileData;
  todaySession: TodayAttendanceSession;
  onClose: () => void;
  onSubmitPunch: (payload: {
    action: 'Check-In' | 'Check-Out';
    workMode: 'Office' | 'WFH' | 'On-Duty';
    locationLabel: string;
    selfieCaptured: boolean;
    confidenceScore: number;
  }) => void;
}

export function FaceCheckInModal({
  visible,
  isDark,
  profile,
  todaySession,
  onClose,
  onSubmitPunch,
}: FaceCheckInModalProps) {
  const palette = getPalette(isDark);
  const isAlreadyCheckedIn = todaySession.status === 'Checked In';
  const actionLabel: 'Check-In' | 'Check-Out' = isAlreadyCheckedIn
    ? 'Check-Out'
    : 'Check-In';

  const [workMode, setWorkMode] = useState<'Office' | 'WFH' | 'On-Duty'>(
    todaySession.workMode || 'Office'
  );
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [geofenceVerified, setGeofenceVerified] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const locationByMode: Record<'Office' | 'WFH' | 'On-Duty', string> = {
    Office: `${profile.location} · 12.9716° N, 77.5946° E`,
    WFH: 'Remote Home Office · Bengaluru Geofence',
    'On-Duty': 'Client Site Visit · Verified GPS',
  };

  const handleConfirm = () => {
    setErrorMsg(null);
    if (!selfieCaptured) {
      setErrorMsg('Please capture your biometric selfie verification first.');
      return;
    }
    if (!geofenceVerified) {
      setErrorMsg('Geofence verification is required before punching.');
      return;
    }
    onSubmitPunch({
      action: actionLabel,
      workMode,
      locationLabel: locationByMode[workMode],
      selfieCaptured: true,
      confidenceScore: 99.1,
    });
    setSelfieCaptured(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[empSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
        <View
          style={[
            empSharedStyles.modalSheet,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={empSharedStyles.dragHandleWrap}>
            <View style={[empSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
          </View>
          <View style={empSharedStyles.modalHeaderRow}>
            <View>
              <Text style={[empSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                Face {actionLabel}
              </Text>
              <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                {profile.fullName} · {profile.employeeId}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Close Face Check-In Modal"
              onPress={onClose}
              style={localStyles.closeIconBtn}
            >
              <X size={20} color={palette.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {errorMsg ? (
              <View
                style={[
                  empSharedStyles.errorBanner,
                  { backgroundColor: palette.roseBg, borderColor: palette.rose },
                ]}
              >
                <Text style={[empSharedStyles.errorBannerText, { color: palette.rose }]}>
                  {errorMsg}
                </Text>
              </View>
            ) : null}

            {/* Biometric Camera Frame */}
            <View
              style={[
                localStyles.scannerFrame,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: selfieCaptured ? palette.emerald : palette.border,
                },
              ]}
            >
              {selfieCaptured ? (
                <View style={localStyles.scannerInner}>
                  <CheckCircle2 size={36} color={palette.emerald} strokeWidth={2.2} />
                  <Text style={[localStyles.scannerTitle, { color: palette.emerald }]}>
                    Biometric Liveness Matched · 99.1%
                  </Text>
                  <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                    Selfie verified for {profile.fullName}
                  </Text>
                </View>
              ) : (
                <View style={localStyles.scannerInner}>
                  <ScanFace size={38} color={palette.primary} strokeWidth={1.8} />
                  <Text style={[localStyles.scannerTitle, { color: palette.textPrimary }]}>
                    Ready for Facial Liveness Check
                  </Text>
                  <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                    Align face in frame and tap capture below
                  </Text>
                </View>
              )}

              <Pressable
                accessibilityLabel={selfieCaptured ? 'Retake Selfie' : 'Capture Live Selfie'}
                onPress={() => {
                  setSelfieCaptured(true);
                  setErrorMsg(null);
                }}
                style={[
                  empSharedStyles.secondaryBtn,
                  {
                    backgroundColor: palette.surface,
                    borderColor: selfieCaptured ? palette.emerald : palette.primary,
                    marginTop: 10,
                  },
                ]}
              >
                <Camera size={16} color={selfieCaptured ? palette.emerald : palette.primary} />
                <Text
                  style={[
                    empSharedStyles.secondaryBtnText,
                    { color: selfieCaptured ? palette.emerald : palette.primary },
                  ]}
                >
                  {selfieCaptured ? 'Selfie Captured (Retake)' : 'Capture Live Selfie'}
                </Text>
              </Pressable>
            </View>

            {/* Work Mode Selector */}
            <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 14 }]}>
              Work Mode
            </Text>
            <View style={empSharedStyles.chipRow}>
              {(['Office', 'WFH', 'On-Duty'] as const).map((mode) => {
                const active = workMode === mode;
                return (
                  <Pressable
                    key={mode}
                    accessibilityLabel={`Work Mode ${mode}`}
                    onPress={() => setWorkMode(mode)}
                    style={[
                      empSharedStyles.filterChip,
                      {
                        backgroundColor: active ? palette.primaryLight : palette.inputBg,
                        borderColor: active ? palette.primary : palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        empSharedStyles.filterChipText,
                        { color: active ? palette.primary : palette.textSecondary },
                      ]}
                    >
                      {mode}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Geofence Status Card */}
            <Pressable
              accessibilityLabel="Toggle Geofence Verification"
              onPress={() => setGeofenceVerified((v) => !v)}
              style={[
                localStyles.geoBox,
                {
                  backgroundColor: geofenceVerified ? palette.emeraldBg : palette.amberBg,
                  borderColor: palette.border,
                },
              ]}
            >
              <MapPin
                size={18}
                color={geofenceVerified ? palette.emerald : palette.amber}
                strokeWidth={2.2}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    empSharedStyles.subTitle,
                    { color: geofenceVerified ? palette.emerald : palette.amber },
                  ]}
                >
                  {geofenceVerified
                    ? 'Geofence Radius Verified (Within 50m)'
                    : 'Tap to Re-verify GPS Geofence'}
                </Text>
                <Text style={[empSharedStyles.metaText, { color: palette.textSecondary }]}>
                  {locationByMode[workMode]}
                </Text>
              </View>
              <ShieldCheck
                size={18}
                color={geofenceVerified ? palette.emerald : palette.amber}
              />
            </Pressable>

            <View style={localStyles.modalFooterRow}>
              <Pressable
                accessibilityLabel="Cancel Face Check-In"
                onPress={onClose}
                style={[
                  empSharedStyles.secondaryBtn,
                  { flex: 1, backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <Text style={[empSharedStyles.secondaryBtnText, { color: palette.textSecondary }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel={`Confirm ${actionLabel}`}
                onPress={handleConfirm}
                style={[empSharedStyles.primaryBtn, { flex: 1.5, backgroundColor: palette.primary }]}
              >
                <Text style={empSharedStyles.primaryBtnText}>Verify &amp; {actionLabel}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================================
 * 2. APPLY LEAVE MODAL
 * ========================================================================== */
interface ApplyLeaveModalProps {
  visible: boolean;
  isDark: boolean;
  balances: LeaveBalanceItem[];
  holidayDates: string[];
  onClose: () => void;
  onSubmitLeave: (payload: {
    leaveKey: LeaveCategoryKey;
    leaveType: string;
    fromDate: string;
    toDate: string;
    isHalfDay: boolean;
    days: number;
    reason: string;
    attachmentName?: string;
  }) => void;
}

export function ApplyLeaveModal({
  visible,
  isDark,
  balances,
  holidayDates,
  onClose,
  onSubmitLeave,
}: ApplyLeaveModalProps) {
  const palette = getPalette(isDark);
  const [leaveKey, setLeaveKey] = useState<LeaveCategoryKey>('casual');
  const [fromDate, setFromDate] = useState('2026-11-18');
  const [toDate, setToDate] = useState('2026-11-18');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [reason, setReason] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedBalance = balances.find((b) => b.key === leaveKey) || balances[0];
  const validation = useMemo(
    () =>
      validateLeaveApplication(
        {
          leaveKey,
          fromDate,
          toDate: isHalfDay ? fromDate : toDate,
          isHalfDay,
          reason,
        },
        balances,
        holidayDates
      ),
    [leaveKey, fromDate, toDate, isHalfDay, reason, balances, holidayDates]
  );

  const handleSubmit = () => {
    const effectiveTo = isHalfDay ? fromDate : toDate;
    const check = validateLeaveApplication(
      { leaveKey, fromDate, toDate: effectiveTo, isHalfDay, reason },
      balances,
      holidayDates
    );
    if (!check.valid) {
      setErrorMsg(check.error || 'Please review leave form details.');
      return;
    }
    onSubmitLeave({
      leaveKey,
      leaveType: selectedBalance?.label || 'Casual Leave',
      fromDate,
      toDate: effectiveTo,
      isHalfDay,
      days: check.days,
      reason: reason.trim(),
      attachmentName: attachmentName.trim() || undefined,
    });
    setReason('');
    setAttachmentName('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[empSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
        <View
          style={[
            empSharedStyles.modalSheet,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={empSharedStyles.dragHandleWrap}>
            <View style={[empSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
          </View>
          <View style={empSharedStyles.modalHeaderRow}>
            <View>
              <Text style={[empSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                Apply for Leave
              </Text>
              <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                Available balance: {selectedBalance?.remaining ?? 0} days ({selectedBalance?.code})
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Close Apply Leave Modal"
              onPress={onClose}
              style={localStyles.closeIconBtn}
            >
              <X size={20} color={palette.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {errorMsg ? (
              <View
                style={[
                  empSharedStyles.errorBanner,
                  { backgroundColor: palette.roseBg, borderColor: palette.rose },
                ]}
              >
                <Text style={[empSharedStyles.errorBannerText, { color: palette.rose }]}>
                  {errorMsg}
                </Text>
              </View>
            ) : null}

            <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Leave Type
            </Text>
            <View style={empSharedStyles.chipRow}>
              {balances.map((b) => {
                const active = leaveKey === b.key;
                return (
                  <Pressable
                    key={b.key}
                    accessibilityLabel={`Select ${b.label}`}
                    onPress={() => {
                      setLeaveKey(b.key);
                      setErrorMsg(null);
                    }}
                    style={[
                      empSharedStyles.filterChip,
                      {
                        backgroundColor: active ? palette.primaryLight : palette.inputBg,
                        borderColor: active ? palette.primary : palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        empSharedStyles.filterChipText,
                        { color: active ? palette.primary : palette.textSecondary },
                      ]}
                    >
                      {b.code} ({b.key === 'unpaid' ? 'LOP' : b.remaining})
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={localStyles.twoColRow}>
              <View style={{ flex: 1 }}>
                <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                  From Date (YYYY-MM-DD)
                </Text>
                <TextInput
                  accessibilityLabel="Leave From Date"
                  value={fromDate}
                  onChangeText={(txt) => {
                    setFromDate(txt);
                    if (isHalfDay) setToDate(txt);
                    setErrorMsg(null);
                  }}
                  placeholder="2026-11-18"
                  placeholderTextColor={palette.textMuted}
                  style={[
                    empSharedStyles.input,
                    empSharedStyles.monoText,
                    {
                      backgroundColor: palette.inputBg,
                      borderColor: palette.border,
                      color: palette.textPrimary,
                    },
                  ]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                  To Date (YYYY-MM-DD)
                </Text>
                <TextInput
                  accessibilityLabel="Leave To Date"
                  value={isHalfDay ? fromDate : toDate}
                  editable={!isHalfDay}
                  onChangeText={(txt) => {
                    setToDate(txt);
                    setErrorMsg(null);
                  }}
                  placeholder="2026-11-18"
                  placeholderTextColor={palette.textMuted}
                  style={[
                    empSharedStyles.input,
                    empSharedStyles.monoText,
                    {
                      backgroundColor: palette.inputBg,
                      borderColor: palette.border,
                      color: isHalfDay ? palette.textMuted : palette.textPrimary,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Half-day toggle + live duration pill */}
            <View style={localStyles.halfDayRow}>
              <Pressable
                accessibilityLabel="Toggle Half Day Leave"
                onPress={() => {
                  const next = !isHalfDay;
                  setIsHalfDay(next);
                  if (next) setToDate(fromDate);
                  setErrorMsg(null);
                }}
                style={[
                  empSharedStyles.filterChip,
                  {
                    backgroundColor: isHalfDay ? palette.primaryLight : palette.inputBg,
                    borderColor: isHalfDay ? palette.primary : palette.border,
                  },
                ]}
              >
                <Text
                  style={[
                    empSharedStyles.filterChipText,
                    { color: isHalfDay ? palette.primary : palette.textSecondary },
                  ]}
                >
                  {isHalfDay ? '✓ Half-Day (0.5 day)' : 'Half-Day Option'}
                </Text>
              </Pressable>

              <View style={[localStyles.durationChip, { backgroundColor: palette.surfaceMuted }]}>
                <Text style={[empSharedStyles.metaText, { color: palette.textSecondary }]}>
                  Calculated:{' '}
                  <Text style={[empSharedStyles.monoText, { fontWeight: '700', color: palette.primary }]}>
                    {validation.days} {validation.days === 1 ? 'day' : 'days'}
                  </Text>
                </Text>
              </View>
            </View>

            <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 12 }]}>
              Reason for Leave
            </Text>
            <TextInput
              accessibilityLabel="Leave Reason"
              value={reason}
              onChangeText={(txt) => {
                setReason(txt);
                setErrorMsg(null);
              }}
              multiline
              placeholder="Provide a brief note for your manager..."
              placeholderTextColor={palette.textMuted}
              style={[
                empSharedStyles.textArea,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                },
              ]}
            />

            <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 12 }]}>
              Supporting Document (Optional)
            </Text>
            <View style={localStyles.attachRow}>
              <TextInput
                accessibilityLabel="Leave Attachment Name"
                value={attachmentName}
                onChangeText={setAttachmentName}
                placeholder="e.g. medical_note.pdf"
                placeholderTextColor={palette.textMuted}
                style={[
                  empSharedStyles.input,
                  {
                    flex: 1,
                    backgroundColor: palette.inputBg,
                    borderColor: palette.border,
                    color: palette.textPrimary,
                  },
                ]}
              />
              <Pressable
                accessibilityLabel="Attach Sample Receipt"
                onPress={() => setAttachmentName('supporting_note_2026.pdf')}
                style={[
                  empSharedStyles.secondaryBtn,
                  { backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <Paperclip size={15} color={palette.primary} />
                <Text style={[empSharedStyles.secondaryBtnText, { color: palette.primary }]}>
                  Attach
                </Text>
              </Pressable>
            </View>

            <View style={localStyles.modalFooterRow}>
              <Pressable
                accessibilityLabel="Cancel Leave Application"
                onPress={onClose}
                style={[
                  empSharedStyles.secondaryBtn,
                  { flex: 1, backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <Text style={[empSharedStyles.secondaryBtnText, { color: palette.textSecondary }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Submit Leave Request"
                onPress={handleSubmit}
                style={[empSharedStyles.primaryBtn, { flex: 1.5, backgroundColor: palette.primary }]}
              >
                <Text style={empSharedStyles.primaryBtnText}>Submit Leave Request</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================================
 * 3. CLAIM EXPENSE MODAL
 * ========================================================================== */
interface ClaimExpenseModalProps {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
  onSubmitExpense: (payload: {
    title: string;
    category: EmployeeExpenseClaim['category'];
    expenseDate: string;
    amount: number;
    receiptName?: string;
    notes: string;
  }) => void;
}

export function ClaimExpenseModal({
  visible,
  isDark,
  onClose,
  onSubmitExpense,
}: ClaimExpenseModalProps) {
  const palette = getPalette(isDark);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EmployeeExpenseClaim['category']>('Travel');
  const [expenseDate, setExpenseDate] = useState('2026-11-12');
  const [amount, setAmount] = useState('');
  const [receiptName, setReceiptName] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = () => {
    const parsedAmount = Number(amount);
    if (title.trim().length < 3) {
      setErrorMsg('Enter a clear expense title (min 3 characters).');
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Enter a valid expense amount greater than 0.');
      return;
    }
    onSubmitExpense({
      title: title.trim(),
      category,
      expenseDate: expenseDate.trim() || '2026-11-12',
      amount: Math.round(parsedAmount),
      receiptName: receiptName.trim() || 'expense_receipt.pdf',
      notes: notes.trim() || 'Submitted via OFC360 Employee Self-Service',
    });
    setTitle('');
    setAmount('');
    setNotes('');
    setReceiptName('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[empSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
        <View
          style={[
            empSharedStyles.modalSheet,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={empSharedStyles.dragHandleWrap}>
            <View style={[empSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
          </View>
          <View style={empSharedStyles.modalHeaderRow}>
            <Text style={[empSharedStyles.modalTitle, { color: palette.textPrimary }]}>
              Claim Expense Reimbursement
            </Text>
            <Pressable
              accessibilityLabel="Close Claim Expense Modal"
              onPress={onClose}
              style={localStyles.closeIconBtn}
            >
              <X size={20} color={palette.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {errorMsg ? (
              <View
                style={[
                  empSharedStyles.errorBanner,
                  { backgroundColor: palette.roseBg, borderColor: palette.rose },
                ]}
              >
                <Text style={[empSharedStyles.errorBannerText, { color: palette.rose }]}>
                  {errorMsg}
                </Text>
              </View>
            ) : null}

            <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Category
            </Text>
            <View style={empSharedStyles.chipRow}>
              {(['Travel', 'Meals', 'Internet & Phone', 'Client Hosting', 'Equipment'] as const).map(
                (cat) => {
                  const active = category === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={[
                        empSharedStyles.filterChip,
                        {
                          backgroundColor: active ? palette.primaryLight : palette.inputBg,
                          borderColor: active ? palette.primary : palette.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          empSharedStyles.filterChipText,
                          { color: active ? palette.primary : palette.textSecondary },
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </View>

            <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 12 }]}>
              Expense Title
            </Text>
            <TextInput
              accessibilityLabel="Expense Title"
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                setErrorMsg(null);
              }}
              placeholder="e.g. Airport Cab & Meal Receipt"
              placeholderTextColor={palette.textMuted}
              style={[
                empSharedStyles.input,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                },
              ]}
            />

            <View style={localStyles.twoColRow}>
              <View style={{ flex: 1 }}>
                <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                  Amount (₹ INR)
                </Text>
                <TextInput
                  accessibilityLabel="Expense Amount"
                  value={amount}
                  onChangeText={(t) => {
                    setAmount(t);
                    setErrorMsg(null);
                  }}
                  keyboardType="numeric"
                  placeholder="1850"
                  placeholderTextColor={palette.textMuted}
                  style={[
                    empSharedStyles.input,
                    empSharedStyles.monoText,
                    {
                      backgroundColor: palette.inputBg,
                      borderColor: palette.border,
                      color: palette.textPrimary,
                    },
                  ]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                  Expense Date
                </Text>
                <TextInput
                  accessibilityLabel="Expense Date"
                  value={expenseDate}
                  onChangeText={setExpenseDate}
                  placeholder="2026-11-12"
                  placeholderTextColor={palette.textMuted}
                  style={[
                    empSharedStyles.input,
                    empSharedStyles.monoText,
                    {
                      backgroundColor: palette.inputBg,
                      borderColor: palette.border,
                      color: palette.textPrimary,
                    },
                  ]}
                />
              </View>
            </View>

            <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 12 }]}>
              Receipt File
            </Text>
            <View style={localStyles.attachRow}>
              <TextInput
                accessibilityLabel="Expense Receipt File"
                value={receiptName}
                onChangeText={setReceiptName}
                placeholder="receipt_scan.pdf"
                placeholderTextColor={palette.textMuted}
                style={[
                  empSharedStyles.input,
                  {
                    flex: 1,
                    backgroundColor: palette.inputBg,
                    borderColor: palette.border,
                    color: palette.textPrimary,
                  },
                ]}
              />
              <Pressable
                onPress={() => setReceiptName(`receipt_${Date.now().toString().slice(-4)}.pdf`)}
                style={[
                  empSharedStyles.secondaryBtn,
                  { backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <Paperclip size={15} color={palette.primary} />
                <Text style={[empSharedStyles.secondaryBtnText, { color: palette.primary }]}>
                  Upload
                </Text>
              </Pressable>
            </View>

            <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 12 }]}>
              Notes
            </Text>
            <TextInput
              accessibilityLabel="Expense Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Business justification or project code"
              placeholderTextColor={palette.textMuted}
              style={[
                empSharedStyles.input,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                },
              ]}
            />

            <View style={localStyles.modalFooterRow}>
              <Pressable
                onPress={onClose}
                style={[
                  empSharedStyles.secondaryBtn,
                  { flex: 1, backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <Text style={[empSharedStyles.secondaryBtnText, { color: palette.textSecondary }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Submit Expense Claim"
                onPress={handleSubmit}
                style={[empSharedStyles.primaryBtn, { flex: 1.5, backgroundColor: palette.primary }]}
              >
                <Text style={empSharedStyles.primaryBtnText}>Submit Claim</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================================
 * 4. RAISE HELPDESK TICKET MODAL
 * ========================================================================== */
interface RaiseTicketModalProps {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
  onSubmitTicket: (payload: {
    category: EmployeeHelpdeskTicket['category'];
    priority: EmployeeHelpdeskTicket['priority'];
    subject: string;
    description: string;
  }) => void;
}

export function RaiseTicketModal({
  visible,
  isDark,
  onClose,
  onSubmitTicket,
}: RaiseTicketModalProps) {
  const palette = getPalette(isDark);
  const [category, setCategory] =
    useState<EmployeeHelpdeskTicket['category']>('HR & Payroll');
  const [priority, setPriority] =
    useState<EmployeeHelpdeskTicket['priority']>('Medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = () => {
    if (subject.trim().length < 4) {
      setErrorMsg('Please enter a ticket subject (min 4 characters).');
      return;
    }
    if (description.trim().length < 8) {
      setErrorMsg('Please describe your issue (min 8 characters).');
      return;
    }
    onSubmitTicket({
      category,
      priority,
      subject: subject.trim(),
      description: description.trim(),
    });
    setSubject('');
    setDescription('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[empSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
        <View
          style={[
            empSharedStyles.modalSheet,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={empSharedStyles.dragHandleWrap}>
            <View style={[empSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
          </View>
          <View style={empSharedStyles.modalHeaderRow}>
            <Text style={[empSharedStyles.modalTitle, { color: palette.textPrimary }]}>
              Raise HR / IT Helpdesk Ticket
            </Text>
            <Pressable
              accessibilityLabel="Close Raise Ticket Modal"
              onPress={onClose}
              style={localStyles.closeIconBtn}
            >
              <X size={20} color={palette.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {errorMsg ? (
              <View
                style={[
                  empSharedStyles.errorBanner,
                  { backgroundColor: palette.roseBg, borderColor: palette.rose },
                ]}
              >
                <Text style={[empSharedStyles.errorBannerText, { color: palette.rose }]}>
                  {errorMsg}
                </Text>
              </View>
            ) : null}

            <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Department Queue
            </Text>
            <View style={empSharedStyles.chipRow}>
              {(['HR & Payroll', 'IT & Hardware', 'Facilities', 'Policy & Benefits'] as const).map(
                (cat) => {
                  const active = category === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={[
                        empSharedStyles.filterChip,
                        {
                          backgroundColor: active ? palette.primaryLight : palette.inputBg,
                          borderColor: active ? palette.primary : palette.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          empSharedStyles.filterChipText,
                          { color: active ? palette.primary : palette.textSecondary },
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </View>

            <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 12 }]}>
              Priority
            </Text>
            <View style={empSharedStyles.chipRow}>
              {(['Low', 'Medium', 'High'] as const).map((p) => {
                const active = priority === p;
                return (
                  <Pressable
                    key={p}
                    onPress={() => setPriority(p)}
                    style={[
                      empSharedStyles.filterChip,
                      {
                        backgroundColor: active ? palette.primaryLight : palette.inputBg,
                        borderColor: active ? palette.primary : palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        empSharedStyles.filterChipText,
                        { color: active ? palette.primary : palette.textSecondary },
                      ]}
                    >
                      {p}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 12 }]}>
              Subject
            </Text>
            <TextInput
              accessibilityLabel="Ticket Subject"
              value={subject}
              onChangeText={(t) => {
                setSubject(t);
                setErrorMsg(null);
              }}
              placeholder="e.g. Request updated address proof letter"
              placeholderTextColor={palette.textMuted}
              style={[
                empSharedStyles.input,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                },
              ]}
            />

            <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 12 }]}>
              Description
            </Text>
            <TextInput
              accessibilityLabel="Ticket Description"
              value={description}
              onChangeText={(t) => {
                setDescription(t);
                setErrorMsg(null);
              }}
              multiline
              placeholder="Include all relevant details for faster resolution..."
              placeholderTextColor={palette.textMuted}
              style={[
                empSharedStyles.textArea,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                },
              ]}
            />

            <View style={localStyles.modalFooterRow}>
              <Pressable
                onPress={onClose}
                style={[
                  empSharedStyles.secondaryBtn,
                  { flex: 1, backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <Text style={[empSharedStyles.secondaryBtnText, { color: palette.textSecondary }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Submit Helpdesk Ticket"
                onPress={handleSubmit}
                style={[empSharedStyles.primaryBtn, { flex: 1.5, backgroundColor: palette.primary }]}
              >
                <Text style={empSharedStyles.primaryBtnText}>Create Ticket</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================================
 * 5. REQUESTS CENTER MODAL (UNIFIED SELF-SERVICE STATUS TRACKER)
 * ========================================================================== */
interface RequestsCenterModalProps {
  visible: boolean;
  isDark: boolean;
  items: UnifiedEmployeeRequestItem[];
  onClose: () => void;
  onCancelLeave: (leaveId: string) => void;
}

export function RequestsCenterModal({
  visible,
  isDark,
  items,
  onClose,
  onCancelLeave,
}: RequestsCenterModalProps) {
  const palette = getPalette(isDark);
  const [filterKind, setFilterKind] = useState<'All' | UnifiedEmployeeRequestItem['kind']>('All');

  const filtered =
    filterKind === 'All' ? items : items.filter((i) => i.kind === filterKind);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[empSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
        <View
          style={[
            empSharedStyles.modalSheet,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={empSharedStyles.dragHandleWrap}>
            <View style={[empSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
          </View>
          <View style={empSharedStyles.modalHeaderRow}>
            <View>
              <Text style={[empSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                My Requests Center
              </Text>
              <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                Leave, shift change, expense &amp; helpdesk requests
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Close Requests Center"
              onPress={onClose}
              style={localStyles.closeIconBtn}
            >
              <X size={20} color={palette.textMuted} />
            </Pressable>
          </View>

          <View style={[empSharedStyles.chipRow, { marginBottom: 12 }]}>
            {(['All', 'Leave', 'Shift Change', 'Expense', 'Helpdesk', 'Exit'] as const).map((k) => {
              const active = filterKind === k;
              return (
                <Pressable
                  key={k}
                  onPress={() => setFilterKind(k)}
                  style={[
                    empSharedStyles.filterChip,
                    {
                      backgroundColor: active ? palette.primaryLight : palette.inputBg,
                      borderColor: active ? palette.primary : palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      empSharedStyles.filterChipText,
                      { color: active ? palette.primary : palette.textSecondary },
                    ]}
                  >
                    {k}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {filtered.length === 0 ? (
              <Text style={[empSharedStyles.metaText, { color: palette.textMuted, paddingVertical: 24, textAlign: 'center' }]}>
                No requests found in this category.
              </Text>
            ) : (
              filtered.map((req, idx) => {
                const tone = getStatusTone(req.status, palette);
                return (
                  <View
                    key={req.id}
                    style={[
                      empSharedStyles.listRow,
                      idx > 0
                        ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                        : null,
                    ]}
                  >
                    <View style={localStyles.reqRowTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                          {req.title}
                        </Text>
                        <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                          {req.kind} · {req.subtitle} · {req.dateLabel}
                        </Text>
                      </View>
                      <View style={[empSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                        <Text style={[empSharedStyles.statusBadgeText, { color: tone.text }]}>
                          {req.status}
                        </Text>
                      </View>
                    </View>
                    {req.kind === 'Leave' && req.status === 'Pending' ? (
                      <Pressable
                        onPress={() => onCancelLeave(req.id)}
                        style={{ marginTop: 8, alignSelf: 'flex-start' }}
                      >
                        <Text style={[empSharedStyles.linkText, { color: palette.rose }]}>
                          Cancel Pending Leave
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  closeIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 18,
    alignItems: 'center',
  },
  scannerInner: {
    alignItems: 'center',
    gap: 6,
  },
  scannerTitle: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  geoBox: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  halfDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 12,
  },
  durationChip: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  attachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalFooterRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  reqRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
});
