import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Clock, MapPin, ScanFace, ShieldCheck } from 'lucide-react';
import { FONT_MONO, FONT_SANS, getPalette } from '../../theme/colors';
import {
  EmployeeAttendanceRecord,
  EmployeePortalState,
  computeEmployeeAttendanceMetrics,
  formatElapsedShiftDuration,
} from '@/lib/employee-portal-logic';
import { empSharedStyles, getStatusTone } from './EmployeeSharedStyles';

interface EmployeeAttendanceTabProps {
  state: EmployeePortalState;
  isDark: boolean;
  onOpenFaceCheckIn: () => void;
}

export function EmployeeAttendanceTab({
  state,
  isDark,
  onOpenFaceCheckIn,
}: EmployeeAttendanceTabProps) {
  const palette = getPalette(isDark);
  const [statusFilter, setStatusFilter] = useState<
    'All' | EmployeeAttendanceRecord['status']
  >('All');
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (state.todaySession.status !== 'Checked In') return;
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [state.todaySession.status]);

  const metrics = computeEmployeeAttendanceMetrics(
    state.attendanceRecords,
    state.todaySession
  );

  const elapsed = formatElapsedShiftDuration(
    state.todaySession.checkInIso,
    state.todaySession.checkOutIso,
    nowMs
  );

  const isCheckedIn = state.todaySession.status === 'Checked In';
  const filteredRecords = useMemo(() => {
    if (statusFilter === 'All') return state.attendanceRecords;
    return state.attendanceRecords.filter((r) => r.status === statusFilter);
  }, [state.attendanceRecords, statusFilter]);

  return (
    <View style={empSharedStyles.stack}>
      {/* Biometric Check-In/Out Hero Card */}
      <View
        style={[
          empSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={styles.heroTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eyebrow, { color: palette.emerald }]}>
              Biometric &amp; Geofence Attendance
            </Text>
            <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
              {isCheckedIn
                ? 'Active Shift In Progress'
                : state.todaySession.status === 'Checked Out'
                ? 'Shift Completed Today'
                : 'Ready to Check In'}
            </Text>
            <View style={styles.metaLine}>
              <MapPin size={13} color={palette.textMuted} />
              <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                {state.todaySession.locationLabel}
              </Text>
            </View>
          </View>
          <View
            style={[
              empSharedStyles.statusBadge,
              {
                backgroundColor: getStatusTone(state.todaySession.status, palette).bg,
              },
            ]}
          >
            <Text
              style={[
                empSharedStyles.statusBadgeText,
                {
                  color: getStatusTone(state.todaySession.status, palette).text,
                },
              ]}
            >
              {state.todaySession.status}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.timerPanel,
            { backgroundColor: palette.inputBg, borderColor: palette.border },
          ]}
        >
          <View>
            <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
              Live Shift Timer
            </Text>
            <Text style={[styles.timerVal, { color: palette.textPrimary }]}>
              {elapsed}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
              Punch-In / Out
            </Text>
            <Text style={[empSharedStyles.subTitle, empSharedStyles.monoText, { color: palette.primary }]}>
              {state.todaySession.checkInTime || '--:--'} →{' '}
              {state.todaySession.checkOutTime || '--:--'}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityLabel={isCheckedIn ? 'Punch Out With Face Check' : 'Punch In With Face Check'}
          onPress={onOpenFaceCheckIn}
          style={[
            empSharedStyles.primaryBtn,
            {
              backgroundColor: isCheckedIn ? palette.secondaryCta : palette.primary,
              marginTop: 12,
            },
          ]}
        >
          <ScanFace size={18} color="#FFFFFF" />
          <Text style={empSharedStyles.primaryBtnText}>
            {isCheckedIn ? 'Face Check-Out' : 'Face Check-In Now'}
          </Text>
        </Pressable>
      </View>

      {/* Monthly Attendance Metrics */}
      <View style={styles.metricsGrid}>
        <View
          style={[
            styles.metricCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
            Monthly Rate
          </Text>
          <Text style={[styles.metricNum, { color: palette.emerald }]}>
            {metrics.attendanceRatePct}%
          </Text>
        </View>
        <View
          style={[
            styles.metricCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
            Present Days
          </Text>
          <Text style={[styles.metricNum, { color: palette.textPrimary }]}>
            {metrics.presentDays}
          </Text>
        </View>
        <View
          style={[
            styles.metricCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
            Late / Half
          </Text>
          <Text style={[styles.metricNum, { color: palette.amber }]}>
            {metrics.lateDays}
          </Text>
        </View>
      </View>

      {/* Monthly Calendar Strip */}
      <View
        style={[
          empSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={empSharedStyles.cardHeaderRow}>
          <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
            November 2026 Calendar
          </Text>
          <View style={styles.verifiedTag}>
            <ShieldCheck size={14} color={palette.emerald} />
            <Text style={[empSharedStyles.metaText, { color: palette.emerald, fontWeight: '600' }]}>
              Geofence Active
            </Text>
          </View>
        </View>

        <View style={styles.calendarStrip}>
          {state.attendanceRecords.slice(0, 8).map((rec) => {
            const tone = getStatusTone(rec.status, palette);
            return (
              <View
                key={rec.id}
                style={[
                  styles.dayCell,
                  { backgroundColor: tone.bg, borderColor: palette.borderSubtle },
                ]}
              >
                <Text style={[styles.dayCellTop, { color: palette.textMuted }]}>
                  {rec.dayName}
                </Text>
                <Text style={[styles.dayCellNum, { color: palette.textPrimary }]}>
                  {rec.dateIso.slice(8)}
                </Text>
                <Text style={[styles.dayCellStatus, { color: tone.text }]}>
                  {rec.status === 'Present'
                    ? 'P'
                    : rec.status === 'Late'
                    ? 'L'
                    : rec.status === 'Half-Day'
                    ? 'HD'
                    : rec.status === 'Holiday'
                    ? 'H'
                    : 'LV'}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Daily Punch Logs */}
      <View
        style={[
          empSharedStyles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary, marginBottom: 10 }]}>
          Daily Punch Logs ({filteredRecords.length})
        </Text>

        <View style={[empSharedStyles.chipRow, { marginBottom: 10 }]}>
          {(['All', 'Present', 'Late', 'Half-Day', 'Leave', 'Holiday'] as const).map(
            (st) => {
              const active = statusFilter === st;
              return (
                <Pressable
                  key={st}
                  onPress={() => setStatusFilter(st)}
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
                    {st}
                  </Text>
                </Pressable>
              );
            }
          )}
        </View>

        {filteredRecords.map((rec, idx) => {
          const tone = getStatusTone(rec.status, palette);
          return (
            <View
              key={rec.id}
              style={[
                empSharedStyles.listRow,
                idx > 0
                  ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                  : null,
              ]}
            >
              <View style={styles.logRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    {rec.displayDate} · {rec.dayName}
                  </Text>
                  <Text style={[empSharedStyles.metaText, empSharedStyles.monoText, { color: palette.textMuted }]}>
                    {rec.checkIn} – {rec.checkOut} · {rec.totalHours}
                  </Text>
                  <Text style={[empSharedStyles.metaText, { color: palette.textSecondary }]}>
                    {rec.workMode} · {rec.location}
                  </Text>
                </View>
                <View style={[empSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                  <Text style={[empSharedStyles.statusBadgeText, { color: tone.text }]}>
                    {rec.status}
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

const styles = StyleSheet.create({
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  eyebrow: {
    fontFamily: FONT_SANS,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timerPanel: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerVal: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  metricNum: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
    fontSize: 22,
    fontWeight: '700',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calendarStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayCell: {
    width: '22%',
    flexGrow: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
  },
  dayCellTop: {
    fontFamily: FONT_SANS,
    fontSize: 10,
    fontWeight: '600',
  },
  dayCellNum: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
    fontSize: 15,
    fontWeight: '700',
  },
  dayCellStatus: {
    fontFamily: FONT_SANS,
    fontSize: 11,
    fontWeight: '700',
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
});
