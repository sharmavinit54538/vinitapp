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
import {
  CalendarClock,
  CalendarDays,
  Clock,
  Coffee,
  MapPin,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { FONT_MONO, FONT_SANS, getPalette } from '../../theme/colors';
import { HolidayCategory, HolidayItem } from '@/lib/hr-dashboard-logic';
import {
  EmployeeRosterDay,
  EmployeeShiftAssignment,
  EmployeeShiftChangeRequest,
} from '@/lib/employee-portal-logic';
import { empSharedStyles, getStatusTone } from './EmployeeSharedStyles';

/* ============================================================================
 * 1. MY SHIFT VIEW + SHIFT CHANGE REQUEST MODAL
 * ========================================================================== */
interface EmployeeShiftViewProps {
  isDark: boolean;
  shift: EmployeeShiftAssignment;
  shiftChangeRequests: EmployeeShiftChangeRequest[];
  onSubmitShiftChange: (payload: {
    requestedShift: string;
    effectiveDate: string;
    reason: string;
  }) => void;
}

export function EmployeeShiftView({
  isDark,
  shift,
  shiftChangeRequests,
  onSubmitShiftChange,
}: EmployeeShiftViewProps) {
  const palette = getPalette(isDark);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestedShift, setRequestedShift] = useState('Flexible Hybrid (FLX · 10:00 AM – 07:00 PM)');
  const [effectiveDate, setEffectiveDate] = useState('2026-11-20');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const shiftOptions = [
    'Morning Shift (MS · 07:00 AM – 04:00 PM)',
    'General Day Shift (GS · 09:30 AM – 06:30 PM)',
    'Flexible Hybrid (FLX · 10:00 AM – 07:00 PM)',
    'Afternoon Shift (AS · 02:00 PM – 11:00 PM)',
  ];

  const handleSubmit = () => {
    if (!effectiveDate.trim()) {
      setErrorMsg('Enter a valid effective date (YYYY-MM-DD).');
      return;
    }
    if (reason.trim().length < 5) {
      setErrorMsg('Please provide a reason for your shift change request.');
      return;
    }
    onSubmitShiftChange({
      requestedShift,
      effectiveDate: effectiveDate.trim(),
      reason: reason.trim(),
    });
    setReason('');
    setErrorMsg(null);
    setIsModalOpen(false);
  };

  return (
    <View style={empSharedStyles.stack}>
      <View
        style={[
          empSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={empSharedStyles.cardHeaderRow}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.primary }]}>
              Assigned Shift Schedule
            </Text>
            <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
              {shift.shiftName} ({shift.shiftCode})
            </Text>
          </View>
          <View style={[empSharedStyles.statusBadge, { backgroundColor: palette.emeraldBg }]}>
            <Text style={[empSharedStyles.statusBadgeText, { color: palette.emerald }]}>
              Active
            </Text>
          </View>
        </View>

        <View style={styles.detailGrid}>
          <View style={[styles.detailTile, { backgroundColor: palette.inputBg, borderColor: palette.border }]}>
            <Clock size={16} color={palette.primary} />
            <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
              Shift Hours
            </Text>
            <Text style={[styles.detailVal, { color: palette.textPrimary }]}>
              {shift.startTime} – {shift.endTime}
            </Text>
          </View>

          <View style={[styles.detailTile, { backgroundColor: palette.inputBg, borderColor: palette.border }]}>
            <Coffee size={16} color={palette.amber} />
            <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
              Break Window
            </Text>
            <Text style={[styles.detailVal, { color: palette.textPrimary }]}>
              {shift.breakDuration}
            </Text>
          </View>
        </View>

        <View style={styles.infoRows}>
          <View style={[styles.infoLine, { borderBottomColor: palette.borderSubtle }]}>
            <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
              Weekly Off Days
            </Text>
            <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
              {shift.weeklyOffDays.join(' · ')}
            </Text>
          </View>
          <View style={[styles.infoLine, { borderBottomColor: palette.borderSubtle }]}>
            <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
              Grace Period
            </Text>
            <Text style={[empSharedStyles.subTitle, empSharedStyles.monoText, { color: palette.textPrimary }]}>
              {shift.gracePeriodMins} mins
            </Text>
          </View>
          <View style={styles.infoLine}>
            <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
              Shift Allowance
            </Text>
            <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
              {shift.allowance}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityLabel="Request Shift Change"
          onPress={() => setIsModalOpen(true)}
          style={[empSharedStyles.primaryBtn, { backgroundColor: palette.primary, marginTop: 14 }]}
        >
          <CalendarClock size={16} color="#FFFFFF" />
          <Text style={empSharedStyles.primaryBtnText}>Request Shift Change</Text>
        </Pressable>
      </View>

      {/* Submitted Shift Change Requests */}
      <View
        style={[
          empSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary, marginBottom: 8 }]}>
          My Shift Change Requests ({shiftChangeRequests.length})
        </Text>
        {shiftChangeRequests.length === 0 ? (
          <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
            No shift change requests submitted.
          </Text>
        ) : (
          shiftChangeRequests.map((req, idx) => {
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
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                      {req.requestedShift}
                    </Text>
                    <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                      Effective {req.effectiveDate} · Submitted {req.submittedAt}
                    </Text>
                    <Text style={[empSharedStyles.metaText, { color: palette.textSecondary, marginTop: 3 }]}>
                      {req.reason}
                    </Text>
                  </View>
                  <View style={[empSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                    <Text style={[empSharedStyles.statusBadgeText, { color: tone.text }]}>
                      {req.status}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Request Shift Change Modal */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}
      >
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
                Request Shift Change
              </Text>
              <Pressable onPress={() => setIsModalOpen(false)}>
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
                Target Shift
              </Text>
              <View style={empSharedStyles.chipRow}>
                {shiftOptions.map((opt) => {
                  const active = requestedShift === opt;
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => setRequestedShift(opt)}
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
                        {opt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 12 }]}>
                Effective From Date (YYYY-MM-DD)
              </Text>
              <TextInput
                accessibilityLabel="Shift Effective Date"
                value={effectiveDate}
                onChangeText={setEffectiveDate}
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

              <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 12 }]}>
                Reason
              </Text>
              <TextInput
                accessibilityLabel="Shift Change Reason"
                value={reason}
                onChangeText={(t) => {
                  setReason(t);
                  setErrorMsg(null);
                }}
                multiline
                placeholder="Explain why you need this shift adjustment..."
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

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setIsModalOpen(false)}
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
                  accessibilityLabel="Submit Shift Change Request"
                  onPress={handleSubmit}
                  style={[empSharedStyles.primaryBtn, { flex: 1.5, backgroundColor: palette.primary }]}
                >
                  <Text style={empSharedStyles.primaryBtnText}>Submit Request</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ============================================================================
 * 2. PERSONAL WEEKLY ROSTER VIEW
 * ========================================================================== */
interface EmployeeRosterViewProps {
  isDark: boolean;
  rosterDays: EmployeeRosterDay[];
  employeeName: string;
  employeeId: string;
}

export function EmployeeRosterView({
  isDark,
  rosterDays,
  employeeName,
  employeeId,
}: EmployeeRosterViewProps) {
  const palette = getPalette(isDark);
  const workingCount = rosterDays.filter((d) => d.shiftCode !== 'OFF').length;
  const wfhCount = rosterDays.filter((d) => d.workMode === 'WFH').length;

  return (
    <View style={empSharedStyles.stack}>
      <View
        style={[
          empSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={empSharedStyles.cardHeaderRow}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.primary }]}>
              Personal Duty Roster · {employeeId}
            </Text>
            <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
              {employeeName} — Weekly Schedule
            </Text>
          </View>
        </View>

        <View style={styles.rosterStatsRow}>
          <View style={[styles.rosterStatBox, { backgroundColor: palette.inputBg, borderColor: palette.border }]}>
            <Text style={[styles.rosterStatNum, { color: palette.textPrimary }]}>
              {workingCount}
            </Text>
            <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
              Scheduled Days
            </Text>
          </View>
          <View style={[styles.rosterStatBox, { backgroundColor: palette.inputBg, borderColor: palette.border }]}>
            <Text style={[styles.rosterStatNum, { color: palette.primary }]}>
              {wfhCount}
            </Text>
            <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
              Hybrid WFH Days
            </Text>
          </View>
          <View style={[styles.rosterStatBox, { backgroundColor: palette.inputBg, borderColor: palette.border }]}>
            <Text style={[styles.rosterStatNum, { color: palette.emerald }]}>
              {rosterDays.length - workingCount}
            </Text>
            <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
              Weekly Offs
            </Text>
          </View>
        </View>

        {rosterDays.map((day, idx) => {
          const isOff = day.shiftCode === 'OFF';
          const badgeTone = isOff
            ? { bg: palette.surfaceMuted, text: palette.textMuted }
            : day.workMode === 'WFH'
            ? { bg: palette.violetBg, text: palette.violet }
            : { bg: palette.primaryLight, text: palette.primary };

          return (
            <View
              key={day.dateIso}
              style={[
                empSharedStyles.listRow,
                idx > 0
                  ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                  : null,
              ]}
            >
              <View style={styles.rowBetween}>
                <View style={styles.dayPillWrap}>
                  <Text style={[styles.dayBadgeText, { color: palette.textPrimary }]}>
                    {day.day}
                  </Text>
                  <Text style={[empSharedStyles.metaText, empSharedStyles.monoText, { color: palette.textMuted }]}>
                    {day.displayDate}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    {day.shiftTitle} ({day.shiftCode})
                  </Text>
                  <Text style={[empSharedStyles.metaText, empSharedStyles.monoText, { color: palette.textMuted }]}>
                    {day.timing}
                  </Text>
                </View>
                <View style={[empSharedStyles.statusBadge, { backgroundColor: badgeTone.bg }]}>
                  <Text style={[empSharedStyles.statusBadgeText, { color: badgeTone.text }]}>
                    {day.workMode}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/* ============================================================================
 * 3. 2026 HOLIDAYS CALENDAR VIEW (WITH OPTIONAL HOLIDAY OPT-IN)
 * ========================================================================== */
interface EmployeeHolidaysViewProps {
  isDark: boolean;
  holidays: HolidayItem[];
  optionalSelections: Record<string, boolean>;
  onToggleOptionalHoliday: (holidayId: string) => void;
}

export function EmployeeHolidaysView({
  isDark,
  holidays,
  optionalSelections,
  onToggleOptionalHoliday,
}: EmployeeHolidaysViewProps) {
  const palette = getPalette(isDark);
  const [categoryFilter, setCategoryFilter] = useState<HolidayCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHolidays = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return holidays.filter((h) => {
      const catMatch = categoryFilter === 'All' || h.category === categoryFilter;
      const searchMatch =
        q === '' ||
        h.name.toLowerCase().includes(q) ||
        h.month.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q);
      return catMatch && searchMatch;
    });
  }, [holidays, categoryFilter, searchQuery]);

  return (
    <View style={empSharedStyles.stack}>
      <View
        style={[
          empSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={empSharedStyles.cardHeaderRow}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.violet }]}>
              2026 Corporate Calendar
            </Text>
            <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
              Company &amp; Regional Holidays ({holidays.length})
            </Text>
          </View>
          <CalendarDays size={20} color={palette.violet} />
        </View>

        <View
          style={[
            styles.searchBox,
            { backgroundColor: palette.inputBg, borderColor: palette.border },
          ]}
        >
          <Search size={15} color={palette.textMuted} />
          <TextInput
            accessibilityLabel="Search 2026 Holidays"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search holiday, month, or hub..."
            placeholderTextColor={palette.textMuted}
            style={[styles.searchInput, { color: palette.textPrimary }]}
          />
        </View>

        <View style={[empSharedStyles.chipRow, { marginTop: 10 }]}>
          {(['All', 'National', 'Gazetted', 'Regional', 'Optional', 'Company'] as const).map(
            (cat) => {
              const active = categoryFilter === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setCategoryFilter(cat)}
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

        <View style={{ marginTop: 10 }}>
          {filteredHolidays.length === 0 ? (
            <Text style={[empSharedStyles.metaText, { color: palette.textMuted, paddingVertical: 18, textAlign: 'center' }]}>
              No holidays match your current filter.
            </Text>
          ) : (
            filteredHolidays.map((h, idx) => {
              const isOptional = h.category === 'Optional' || h.isOptional;
              const isSelected = Boolean(optionalSelections[h.id] ?? h.userSelected);
              return (
                <View
                  key={h.id}
                  style={[
                    empSharedStyles.listRow,
                    idx > 0
                      ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                      : null,
                  ]}
                >
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                        {h.name}
                      </Text>
                      <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                        <Text style={empSharedStyles.monoText}>{h.displayDate}</Text> · {h.dayOfWeek} · {h.category}
                      </Text>
                      <View style={styles.locRow}>
                        <MapPin size={12} color={palette.textMuted} />
                        <Text style={[empSharedStyles.metaText, { color: palette.textSecondary }]}>
                          {h.location}
                        </Text>
                      </View>
                    </View>
                    {isOptional ? (
                      <Pressable
                        accessibilityLabel={`${isSelected ? 'Cancel' : 'Opt In'} ${h.name}`}
                        onPress={() => onToggleOptionalHoliday(h.id)}
                        style={[
                          empSharedStyles.filterChip,
                          {
                            backgroundColor: isSelected ? palette.emeraldBg : palette.inputBg,
                            borderColor: isSelected ? palette.emerald : palette.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            empSharedStyles.filterChipText,
                            { color: isSelected ? palette.emerald : palette.primary },
                          ]}
                        >
                          {isSelected ? '✓ Opted In' : 'Opt In'}
                        </Text>
                      </Pressable>
                    ) : (
                      <View style={[empSharedStyles.statusBadge, { backgroundColor: palette.primaryLight }]}>
                        <Text style={[empSharedStyles.statusBadgeText, { color: palette.primary }]}>
                          Paid Off
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: FONT_SANS,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  detailTile: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  detailVal: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
    fontSize: 12,
    fontWeight: '700',
  },
  infoRows: {
    marginTop: 12,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  rosterStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  rosterStatBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  rosterStatNum: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
    fontSize: 20,
    fontWeight: '700',
  },
  dayPillWrap: {
    width: 56,
  },
  dayBadgeText: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    fontWeight: '700',
  },
  searchBox: {
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT_SANS,
    fontSize: 13,
    paddingVertical: 8,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
});
