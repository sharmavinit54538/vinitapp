import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import { getPalette, FONT_SANS, FONT_MONO } from '../theme/colors';
import {
  ShiftItem,
  RosterEntry,
  filterRosterEntries,
  shiftFormSchema,
} from '@/lib/hr-dashboard-logic';
import {
  useSaveShiftMutation,
  useAssignRosterShiftMutation,
} from '@/lib/store/hr-api';

interface ShiftsAndRostersScreenProps {
  mode: 'shifts' | 'rosters';
  shifts: ShiftItem[];
  rosters: RosterEntry[];
  isDark: boolean;
  canManage: boolean;
  onSuccessToast: (msg: string) => void;
}

const SHIFT_CODES: ('MS' | 'GS' | 'NS' | 'FLX' | 'OFF')[] = ['GS', 'MS', 'NS', 'FLX', 'OFF'];

export function ShiftsAndRostersScreen({
  mode,
  shifts,
  rosters,
  isDark,
  canManage,
  onSuccessToast,
}: ShiftsAndRostersScreenProps) {
  const palette = getPalette(isDark);
  const [saveShift, { isLoading: isSavingShift }] = useSaveShiftMutation();
  const [assignRosterShift] = useAssignRosterShiftMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftItem | null>(null);
  const [name, setName] = useState('General Shift');
  const [code, setCode] = useState('GS');
  const [startTime, setStartTime] = useState('09:30 AM');
  const [endTime, setEndTime] = useState('06:30 PM');
  const [breakDuration, setBreakDuration] = useState('60 mins');
  const [allowance, setAllowance] = useState('$0 / day');
  const [assignedEmployees, setAssignedEmployees] = useState('45');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [rosterSearch, setRosterSearch] = useState('');
  const filteredRosters = filterRosterEntries(rosters, 'All', rosterSearch);

  const openCreateShift = () => {
    setEditingShift(null);
    setName('');
    setCode('GS');
    setStartTime('09:30 AM');
    setEndTime('06:30 PM');
    setBreakDuration('60 mins');
    setAllowance('$15 / day');
    setAssignedEmployees('25');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditShift = (s: ShiftItem) => {
    setEditingShift(s);
    setName(s.name);
    setCode(s.code);
    setStartTime(s.startTime);
    setEndTime(s.endTime);
    setBreakDuration(s.breakDuration);
    setAllowance(s.allowance);
    setAssignedEmployees(String(s.assignedEmployees));
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSaveShift = async () => {
    setErrorMsg(null);
    const parsed = shiftFormSchema.safeParse({
      name,
      code,
      startTime,
      endTime,
      breakDuration,
      allowance,
      assignedEmployees: Number(assignedEmployees) || 1,
    });

    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message || 'Please check shift fields');
      return;
    }

    try {
      await saveShift({
        id: editingShift?.id,
        ...parsed.data,
        status: 'Active',
        departments: ['Engineering', 'Operations'],
      }).unwrap();
      onSuccessToast(`Shift ${parsed.data.name} saved`);
      setIsModalOpen(false);
    } catch {
      setErrorMsg('Failed to save shift configuration');
    }
  };

  const handleCycleRosterCode = async (
    rosterId: string,
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun',
    currentCode: 'MS' | 'GS' | 'NS' | 'FLX' | 'OFF'
  ) => {
    if (!canManage) return;
    const nextIdx = (SHIFT_CODES.indexOf(currentCode) + 1) % SHIFT_CODES.length;
    const nextCode = SHIFT_CODES[nextIdx];
    try {
      await assignRosterShift({
        rosterId,
        day,
        shiftCode: nextCode,
      }).unwrap();
      onSuccessToast(`Updated ${day} shift to ${nextCode}`);
    } catch {
      onSuccessToast('Unable to update shift assignment');
    }
  };

  if (mode === 'shifts') {
    return (
      <View style={styles.stack}>
        <View
          style={[
            styles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.titleWrap}>
              <Text style={[styles.title, { color: palette.textPrimary }]}>
                Shift Windows & Allowances
              </Text>
              <Text style={[styles.subtitle, { color: palette.textMuted }]}>
                Active enterprise shift configurations
              </Text>
            </View>
            {canManage ? (
              <Pressable
                onPress={openCreateShift}
                style={[styles.primaryBtn, { backgroundColor: palette.primary }]}
              >
                <Text style={styles.primaryBtnText}>+ Create Shift</Text>
              </Pressable>
            ) : null}
          </View>

          {shifts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>
                No Shift Windows Configured
              </Text>
              <Text style={[styles.emptySub, { color: palette.textMuted }]}>
                Tap &ldquo;+ Create Shift&rdquo; to configure Morning, General, or Night shift windows.
              </Text>
            </View>
          ) : (
            shifts.map((s, idx) => (
              <View
                key={s.id}
                style={[
                  styles.itemRow,
                  idx > 0
                    ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                    : null,
                ]}
              >
                <View style={styles.itemHeader}>
                  <View style={styles.titleWrap}>
                    <Text style={[styles.itemName, { color: palette.textPrimary }]}>
                      {s.name} · <Text style={styles.monoInline}>{s.code}</Text>
                    </Text>
                    <Text style={[styles.itemMeta, { color: palette.textMuted }]}>
                      <Text style={styles.monoInline}>{s.startTime} – {s.endTime}</Text> · Break: {s.breakDuration} · {s.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemFooter}>
                  <Text style={[styles.itemMeta, { color: palette.textSecondary }]}>
                    <Text style={styles.monoInline}>{s.assignedEmployees}</Text> Assigned · Allowance: <Text style={styles.monoInline}>{s.allowance}</Text>
                  </Text>
                  {canManage ? (
                    <Pressable onPress={() => openEditShift(s)}>
                      <Text style={[styles.editLink, { color: palette.primary }]}>Edit</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </View>

        <Modal
          visible={isModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsModalOpen(false)}
        >
          <View style={[styles.sheetBackdrop, { backgroundColor: palette.overlay }]}>
            <View
              style={[
                styles.bottomSheet,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <View style={styles.handleWrap}>
                <View style={[styles.handleBar, { backgroundColor: palette.handleBar }]} />
              </View>
              <Text style={[styles.title, { color: palette.textPrimary }]}>
                {editingShift ? 'Edit Shift Window' : 'Create Shift Window'}
              </Text>
              {errorMsg ? (
                <Text style={[styles.errText, { color: palette.rose }]}>{errorMsg}</Text>
              ) : null}

              <Text style={[styles.label, { color: palette.textSecondary }]}>Shift Name *</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Morning Shift"
                placeholderTextColor={palette.textMuted}
                style={[
                  styles.input,
                  {
                    backgroundColor: palette.inputBg,
                    borderColor: palette.border,
                    color: palette.textPrimary,
                  },
                ]}
              />

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={[styles.label, { color: palette.textSecondary }]}>Code *</Text>
                  <TextInput
                    value={code}
                    onChangeText={setCode}
                    placeholder="MS"
                    placeholderTextColor={palette.textMuted}
                    style={[
                      styles.monoInput,
                      {
                        backgroundColor: palette.inputBg,
                        borderColor: palette.border,
                        color: palette.textPrimary,
                      },
                    ]}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={[styles.label, { color: palette.textSecondary }]}>Headcount *</Text>
                  <TextInput
                    value={assignedEmployees}
                    onChangeText={setAssignedEmployees}
                    keyboardType="numeric"
                    placeholder="30"
                    placeholderTextColor={palette.textMuted}
                    style={[
                      styles.monoInput,
                      {
                        backgroundColor: palette.inputBg,
                        borderColor: palette.border,
                        color: palette.textPrimary,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={[styles.label, { color: palette.textSecondary }]}>Start Time *</Text>
                  <TextInput
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="06:00 AM"
                    placeholderTextColor={palette.textMuted}
                    style={[
                      styles.monoInput,
                      {
                        backgroundColor: palette.inputBg,
                        borderColor: palette.border,
                        color: palette.textPrimary,
                      },
                    ]}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={[styles.label, { color: palette.textSecondary }]}>End Time *</Text>
                  <TextInput
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="03:00 PM"
                    placeholderTextColor={palette.textMuted}
                    style={[
                      styles.monoInput,
                      {
                        backgroundColor: palette.inputBg,
                        borderColor: palette.border,
                        color: palette.textPrimary,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setIsModalOpen(false)}
                  style={[
                    styles.cancelBtn,
                    { backgroundColor: palette.inputBg, borderColor: palette.border },
                  ]}
                >
                  <Text style={[styles.cancelBtnText, { color: palette.textSecondary }]}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSaveShift}
                  disabled={isSavingShift}
                  style={[styles.saveBtn, { backgroundColor: palette.primary }]}
                >
                  <Text style={styles.primaryBtnText}>
                    {isSavingShift ? 'Saving...' : 'Save Shift'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      <View
        style={[
          styles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Text style={[styles.title, { color: palette.textPrimary }]}>
          Weekly Duty Rosters
        </Text>
        <Text style={[styles.subtitle, { color: palette.textMuted, marginBottom: 12 }]}>
          Tap any day chip to cycle employee shift assignment
        </Text>

        <TextInput
          value={rosterSearch}
          onChangeText={setRosterSearch}
          placeholder="Search employee roster..."
          placeholderTextColor={palette.textMuted}
          style={[
            styles.input,
            {
              backgroundColor: palette.inputBg,
              borderColor: palette.border,
              color: palette.textPrimary,
            },
          ]}
        />

        {filteredRosters.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>
              No Active Duty Rosters
            </Text>
            <Text style={[styles.emptySub, { color: palette.textMuted }]}>
              No employee roster entries are currently assigned.
            </Text>
          </View>
        ) : (
          filteredRosters.map((r, idx) => (
            <View
              key={r.id}
              style={[
                styles.itemRow,
                idx > 0
                  ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                  : null,
              ]}
            >
              <Text style={[styles.itemName, { color: palette.textPrimary }]}>
                {r.employeeName} · <Text style={styles.monoInline}>{r.employeeId}</Text>
              </Text>
              <Text style={[styles.itemMeta, { color: palette.textMuted }]}>
                {r.designation} · {r.department}
              </Text>
              <View style={styles.dayRow}>
                {r.schedule.map((slot) => (
                  <Pressable
                    key={slot.day}
                    onPress={() => handleCycleRosterCode(r.id, slot.day, slot.shiftCode)}
                    style={[
                      styles.dayChip,
                      {
                        backgroundColor:
                          slot.shiftCode === 'OFF' ? palette.roseBg : palette.inputBg,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <Text style={[styles.dayLabel, { color: palette.textMuted }]}>
                      {slot.day}
                    </Text>
                    <Text
                      style={[
                        styles.dayCode,
                        {
                          color:
                            slot.shiftCode === 'OFF' ? palette.rose : palette.primary,
                        },
                      ]}
                    >
                      {slot.shiftCode}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 16,
  },
  card: {
    borderRadius: 24, // rounded-3xl
    borderWidth: 1,
    padding: 20, // p-5
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleWrap: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontFamily: FONT_SANS,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    marginTop: 2,
  },
  primaryBtn: {
    paddingHorizontal: 16,
    height: 48, // h-12 touch target
    borderRadius: 16, // rounded-2xl
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: FONT_SANS,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '700',
  },
  emptySub: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  itemRow: {
    paddingVertical: 14,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '700',
  },
  itemMeta: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    marginTop: 2,
  },
  monoInline: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  editLink: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 4,
  },
  dayChip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  dayLabel: {
    fontFamily: FONT_SANS,
    fontSize: 10,
    fontWeight: '600',
  },
  dayCode: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  sheetBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    borderTopLeftRadius: 24, // rounded-3xl
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  handleWrap: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  handleBar: {
    width: 40, // w-10
    height: 6, // h-1.5
    borderRadius: 3,
  },
  label: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    fontFamily: FONT_SANS,
    height: 48, // h-12
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  monoInput: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
    height: 48, // h-12
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
  },
  errText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    height: 48, // h-12
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1.5,
    height: 48, // h-12
    borderRadius: 16, // rounded-2xl
    alignItems: 'center',
    justifyContent: 'center',
  },
});
