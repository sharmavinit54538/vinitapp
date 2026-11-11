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
  HrDashboardDataState,
  calculateAttendancePercentages,
} from '@/lib/hr-dashboard-logic';
import { useRecordFaceAttendanceMutation } from '@/lib/store/hr-api';

interface AttendanceScreenProps {
  data: HrDashboardDataState;
  isDark: boolean;
  onSuccessToast: (msg: string) => void;
}

export function AttendanceScreen({
  data,
  isDark,
  onSuccessToast,
}: AttendanceScreenProps) {
  const palette = getPalette(isDark);
  const [recordFaceAttendance, { isLoading }] = useRecordFaceAttendanceMutation();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [employeeName, setEmployeeName] = useState(data.adminProfile.name);
  const [employeeId, setEmployeeId] = useState(data.adminProfile.employeeId);
  const [department, setDepartment] = useState(data.adminProfile.department);
  const [punchType, setPunchType] = useState<'Check-In' | 'Late Check-In' | 'Check-Out'>('Check-In');

  const stats = calculateAttendancePercentages(data.kpis.attendance);
  const faceLogs = data.faceAttendanceLogs || [];

  const handleFaceVerify = async () => {
    try {
      await recordFaceAttendance({
        employeeName: employeeName.trim() || data.adminProfile.name,
        employeeId: employeeId.trim() || data.adminProfile.employeeId,
        department: department.trim() || 'People Operations',
        punchType,
        location: data.adminProfile.location,
      }).unwrap();
      onSuccessToast(`Biometric ${punchType} verified for ${employeeName}`);
      setIsScannerOpen(false);
    } catch {
      onSuccessToast('Unable to record biometric attendance');
    }
  };

  return (
    <View style={styles.stack}>
      {/* Biometric Face Attendance Action Banner (rounded-3xl p-5) */}
      <View
        style={[
          styles.heroCard,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={styles.heroRow}>
          <View style={styles.heroTextCol}>
            <Text style={[styles.eyebrow, { color: palette.emerald }]}>
              Biometric Liveness Verification
            </Text>
            <Text style={[styles.title, { color: palette.textPrimary }]}>
              Face Attendance Check-In
            </Text>
            <Text style={[styles.sub, { color: palette.textMuted }]}>
              Instant mobile facial verification & geofenced punch logging
            </Text>
          </View>
          <Pressable
            onPress={() => setIsScannerOpen(true)}
            style={[styles.scanBtn, { backgroundColor: palette.primary }]}
          >
            <Text style={styles.scanBtnText}>Launch Scanner</Text>
          </Pressable>
        </View>
      </View>

      {/* Live Attendance KPI Grid (rounded-3xl p-5, tabular-nums monospace) */}
      <View style={styles.kpiGrid}>
        <View
          style={[
            styles.kpiCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>Present</Text>
          <Text style={[styles.kpiVal, { color: palette.emerald }]}>
            {data.kpis.attendance.present}
          </Text>
          <Text style={[styles.kpiSub, { color: palette.textSecondary }]}>
            <Text style={styles.monoInline}>{stats.presentPct}%</Text> of logged
          </Text>
        </View>

        <View
          style={[
            styles.kpiCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>Late Check-In</Text>
          <Text style={[styles.kpiVal, { color: palette.amber }]}>
            {data.kpis.attendance.late}
          </Text>
          <Text style={[styles.kpiSub, { color: palette.textSecondary }]}>
            <Text style={styles.monoInline}>{stats.latePct}%</Text> of logged
          </Text>
        </View>

        <View
          style={[
            styles.kpiCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>On Leave</Text>
          <Text style={[styles.kpiVal, { color: palette.primary }]}>
            {data.kpis.attendance.onLeave}
          </Text>
          <Text style={[styles.kpiSub, { color: palette.textSecondary }]}>
            Approved leaves
          </Text>
        </View>

        <View
          style={[
            styles.kpiCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>Absent</Text>
          <Text style={[styles.kpiVal, { color: palette.rose }]}>
            {data.kpis.attendance.absent}
          </Text>
          <Text style={[styles.kpiSub, { color: palette.textSecondary }]}>
            Unscheduled
          </Text>
        </View>
      </View>

      {/* Verified Biometric Attendance Logs (Single-elevation card, hairline dividers) */}
      <View
        style={[
          styles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Live Biometric Check-In Logs ({faceLogs.length})
        </Text>
        {faceLogs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>
              No Biometric Punches Recorded Today
            </Text>
            <Text style={[styles.emptySub, { color: palette.textMuted }]}>
              Tap &ldquo;Launch Scanner&rdquo; above to record your first real-time Face Attendance check-in.
            </Text>
          </View>
        ) : (
          faceLogs.map((log, idx) => (
            <View
              key={log.id}
              style={[
                styles.logRow,
                idx > 0
                  ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                  : null,
              ]}
            >
              <View style={styles.logInfo}>
                <Text style={[styles.logName, { color: palette.textPrimary }]}>
                  {log.employeeName} · <Text style={styles.monoInline}>{log.employeeId}</Text>
                </Text>
                <Text style={[styles.logMeta, { color: palette.textMuted }]}>
                  {log.department} · <Text style={styles.monoInline}>{log.timestamp}</Text> · {log.location}
                </Text>
              </View>
              <Text style={[styles.logStatusText, { color: palette.emerald }]}>
                {log.punchType} · <Text style={styles.monoInline}>{log.confidenceScore}%</Text>
              </Text>
            </View>
          ))
        )}
      </View>

      {/* FACE ATTENDANCE SCANNER BOTTOM SHEET */}
      <Modal
        visible={isScannerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsScannerOpen(false)}
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
            <Text style={[styles.eyebrow, { color: palette.emerald }]}>
              OFC360 Face ID Verification
            </Text>
            <Text style={[styles.title, { color: palette.textPrimary, marginTop: 2 }]}>
              Biometric Camera Check-In
            </Text>

            {/* Simulated Mobile Camera Viewfinder Frame */}
            <View
              style={[
                styles.cameraFrame,
                { backgroundColor: '#020617', borderColor: palette.emerald },
              ]}
            >
              <View style={[styles.faceReticle, { borderColor: palette.emerald }]}>
                <Text style={styles.cameraStatusText}>Liveness Verified · 99.4%</Text>
              </View>
              <Text style={styles.cameraHint}>
                Position face inside the biometric frame
              </Text>
            </View>

            <Text style={[styles.label, { color: palette.textSecondary }]}>Employee Name</Text>
            <TextInput
              value={employeeName}
              onChangeText={setEmployeeName}
              style={[
                styles.input,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                },
              ]}
            />

            <View style={styles.twoCol}>
              <View style={styles.col}>
                <Text style={[styles.label, { color: palette.textSecondary }]}>Employee ID</Text>
                <TextInput
                  value={employeeId}
                  onChangeText={setEmployeeId}
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
                <Text style={[styles.label, { color: palette.textSecondary }]}>Department</Text>
                <TextInput
                  value={department}
                  onChangeText={setDepartment}
                  style={[
                    styles.input,
                    {
                      backgroundColor: palette.inputBg,
                      borderColor: palette.border,
                      color: palette.textPrimary,
                    },
                  ]}
                />
              </View>
            </View>

            <Text style={[styles.label, { color: palette.textSecondary }]}>Punch Type</Text>
            <View
              style={[
                styles.segmentedRow,
                { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
              ]}
            >
              {(['Check-In', 'Late Check-In', 'Check-Out'] as const).map((pt) => {
                const active = punchType === pt;
                return (
                  <Pressable
                    key={pt}
                    onPress={() => setPunchType(pt)}
                    style={[
                      styles.segmentChip,
                      active
                        ? {
                            backgroundColor: palette.surface,
                            borderColor: palette.border,
                            borderWidth: 1,
                          }
                        : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: active ? palette.primary : palette.textSecondary },
                      ]}
                    >
                      {pt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.btnRow}>
              <Pressable
                onPress={() => setIsScannerOpen(false)}
                style={[
                  styles.cancelBtn,
                  { backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <Text style={[styles.cancelText, { color: palette.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleFaceVerify}
                disabled={isLoading}
                style={[styles.verifyBtn, { backgroundColor: palette.primary }]}
              >
                <Text style={styles.scanBtnText}>
                  {isLoading ? 'Verifying...' : `Verify & ${punchType}`}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 16,
  },
  heroCard: {
    borderRadius: 24, // rounded-3xl
    borderWidth: 1,
    padding: 20, // p-5
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroTextCol: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontFamily: FONT_SANS,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  sub: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    marginTop: 2,
  },
  scanBtn: {
    paddingHorizontal: 16,
    height: 48, // h-12 touch target
    borderRadius: 16, // rounded-2xl
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBtnText: {
    fontFamily: FONT_SANS,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 24, // rounded-3xl
    borderWidth: 1,
    padding: 20, // p-5
  },
  kpiLabel: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
  },
  kpiVal: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.6,
    marginVertical: 4,
  },
  kpiSub: {
    fontFamily: FONT_SANS,
    fontSize: 12,
  },
  monoInline: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
  },
  card: {
    borderRadius: 24, // rounded-3xl
    borderWidth: 1,
    padding: 20, // p-5
  },
  sectionTitle: {
    fontFamily: FONT_SANS,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  emptyBox: {
    paddingVertical: 24,
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
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    gap: 8,
  },
  logInfo: {
    flex: 1,
  },
  logName: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '700',
  },
  logMeta: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    marginTop: 2,
  },
  logStatusText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
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
  cameraFrame: {
    height: 144,
    borderRadius: 20,
    borderWidth: 1.5,
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceReticle: {
    width: 164,
    height: 88,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraStatusText: {
    fontFamily: FONT_MONO,
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  cameraHint: {
    fontFamily: FONT_SANS,
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 8,
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
  twoCol: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
  },
  segmentedRow: {
    flexDirection: 'row',
    padding: 4, // p-1
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    gap: 4,
  },
  segmentChip: {
    flex: 1,
    minHeight: 40, // min-h-[40px]
    borderRadius: 12, // rounded-xl
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
  },
  btnRow: {
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
  cancelText: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '600',
  },
  verifyBtn: {
    flex: 1.5,
    height: 48, // h-12
    borderRadius: 16, // rounded-2xl
    alignItems: 'center',
    justifyContent: 'center',
  },
});
