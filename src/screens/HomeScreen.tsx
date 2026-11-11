import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import {
  LayoutDashboard,
  Clock,
  CalendarClock,
  CalendarDays,
  Users,
  UserCheck,
  ClipboardCheck,
  UserPlus,
  Megaphone,
  ScanFace,
  Wallet,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { getPalette, FONT_SANS, FONT_MONO } from '../theme/colors';
import {
  HrDashboardDataState,
  HomeInternalTab,
  BottomNavTab,
  calculateAttendancePercentages,
} from '@/lib/hr-dashboard-logic';
import {
  useDecideApprovalMutation,
  useTriggerPayrollRunMutation,
} from '@/lib/store/hr-api';
import { ShiftsAndRostersScreen } from './ShiftsAndRostersScreen';
import { HolidayCalendarScreen } from './HolidayCalendarScreen';

interface HomeScreenProps {
  data: HrDashboardDataState;
  activeHomeTab: HomeInternalTab;
  onSelectHomeTab: (tab: HomeInternalTab) => void;
  onNavigateTab: (tab: BottomNavTab) => void;
  onOpenAddEmployee: () => void;
  onOpenAnnouncement: () => void;
  isDark: boolean;
  canManage: boolean;
  onSuccessToast: (msg: string) => void;
}

const HOME_TABS: {
  id: HomeInternalTab;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}[] = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'shifts', label: 'Shifts', Icon: Clock },
  { id: 'rosters', label: 'Rosters', Icon: CalendarClock },
  { id: 'holidays', label: 'Holidays', Icon: CalendarDays },
];

export function HomeScreen({
  data,
  activeHomeTab,
  onSelectHomeTab,
  onNavigateTab,
  onOpenAddEmployee,
  onOpenAnnouncement,
  isDark,
  canManage,
  onSuccessToast,
}: HomeScreenProps) {
  const palette = getPalette(isDark);
  const [decideApproval] = useDecideApprovalMutation();
  const [triggerPayroll, { isLoading: isRunningPayroll }] = useTriggerPayrollRunMutation();

  const attendanceStats = calculateAttendancePercentages(data.kpis.attendance);
  const pendingApprovals = data.approvals.filter((a) => a.status === 'Pending');

  const handleDecision = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await decideApproval({ id, status }).unwrap();
      onSuccessToast(`Request ${status.toLowerCase()}`);
    } catch {
      onSuccessToast('Could not process request');
    }
  };

  const handlePayrollRun = async () => {
    try {
      const res = await triggerPayroll().unwrap();
      onSuccessToast(res.message || 'Payroll cycle updated');
    } catch {
      onSuccessToast('Payroll cycle action failed');
    }
  };

  return (
    <View style={styles.container}>
      {/* Segmented Sub-Tab Navigation (p-1 rounded-2xl bg-slate-100/90 with active white/indigo-600 rounded-xl min-h-[40px]) */}
      <View
        style={[
          styles.tabSegmentBar,
          { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
        ]}
      >
        {HOME_TABS.map((t) => {
          const active = activeHomeTab === t.id;
          const SubTabIcon = t.Icon;
          return (
            <Pressable
              key={t.id}
              onPress={() => onSelectHomeTab(t.id)}
              style={[
                styles.segmentButton,
                active
                  ? {
                      backgroundColor: palette.surface,
                      borderColor: palette.border,
                      borderWidth: 1,
                    }
                  : null,
              ]}
            >
              <SubTabIcon
                size={14}
                color={active ? palette.primary : palette.textMuted}
                strokeWidth={active ? 2.3 : 2}
              />
              <Text
                style={[
                  styles.segmentButtonText,
                  { color: active ? palette.primary : palette.textMuted },
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeHomeTab === 'overview' ? (
        <View style={styles.stack}>
          {/* 4 Live KPI Cards (rounded-3xl p-5, tabular-nums monospace metrics) */}
          <View style={styles.kpiGrid}>
            <Pressable
              onPress={() => onNavigateTab('workforce')}
              style={[
                styles.kpiCard,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <View style={styles.kpiTopRow}>
                <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>
                  Active Workforce
                </Text>
                <Users size={16} color={palette.primary} strokeWidth={2.2} />
              </View>
              <Text style={[styles.kpiVal, { color: palette.textPrimary }]}>
                {data.workforce.length}
              </Text>
              <View style={styles.kpiFooterRow}>
                <Text style={[styles.kpiMeta, { color: palette.textMuted }]}>
                  Directory records
                </Text>
                <ChevronRight size={13} color={palette.textMuted} />
              </View>
            </Pressable>

            <Pressable
              onPress={() => onNavigateTab('attendance')}
              style={[
                styles.kpiCard,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <View style={styles.kpiTopRow}>
                <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>
                  Attendance Rate
                </Text>
                <UserCheck size={16} color={palette.emerald} strokeWidth={2.2} />
              </View>
              <Text style={[styles.kpiVal, { color: palette.emerald }]}>
                {attendanceStats.effectivePresentPct}%
              </Text>
              <View style={styles.kpiFooterRow}>
                <Text style={[styles.kpiMeta, { color: palette.textMuted }]}>
                  {data.kpis.attendance.present} Present today
                </Text>
                <ChevronRight size={13} color={palette.textMuted} />
              </View>
            </Pressable>

            <Pressable
              onPress={() => onNavigateTab('approvals')}
              style={[
                styles.kpiCard,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <View style={styles.kpiTopRow}>
                <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>
                  Pending Approvals
                </Text>
                <ClipboardCheck size={16} color={palette.amber} strokeWidth={2.2} />
              </View>
              <Text style={[styles.kpiVal, { color: palette.amber }]}>
                {pendingApprovals.length}
              </Text>
              <View style={styles.kpiFooterRow}>
                <Text style={[styles.kpiMeta, { color: palette.textMuted }]}>
                  Review queue
                </Text>
                <ChevronRight size={13} color={palette.textMuted} />
              </View>
            </Pressable>

            <Pressable
              onPress={() => onSelectHomeTab('holidays')}
              style={[
                styles.kpiCard,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <View style={styles.kpiTopRow}>
                <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>
                  2026 Holidays
                </Text>
                <CalendarDays size={16} color={palette.violet} strokeWidth={2.2} />
              </View>
              <Text style={[styles.kpiVal, { color: palette.textPrimary }]}>
                {data.holidays.length}
              </Text>
              <View style={styles.kpiFooterRow}>
                <Text style={[styles.kpiMeta, { color: palette.primary }]}>
                  Open calendar
                </Text>
                <ChevronRight size={13} color={palette.primary} />
              </View>
            </Pressable>
          </View>

          {/* Quick Actions Touch Bar (rounded-3xl p-5, h-12 rounded-2xl buttons) */}
          {canManage ? (
            <View
              style={[
                styles.card,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                Quick HR Actions
              </Text>
              <View style={styles.quickGrid}>
                <Pressable
                  onPress={onOpenAddEmployee}
                  style={[
                    styles.quickBtn,
                    { backgroundColor: palette.inputBg, borderColor: palette.border },
                  ]}
                >
                  <UserPlus size={18} color={palette.primary} strokeWidth={2.2} />
                  <Text style={[styles.quickBtnTitle, { color: palette.textPrimary }]}>
                    Add Employee
                  </Text>
                  <Text style={[styles.quickBtnSub, { color: palette.textMuted }]}>
                    Onboard to directory
                  </Text>
                </Pressable>

                <Pressable
                  onPress={onOpenAnnouncement}
                  style={[
                    styles.quickBtn,
                    { backgroundColor: palette.inputBg, borderColor: palette.border },
                  ]}
                >
                  <Megaphone size={18} color={palette.violet} strokeWidth={2.2} />
                  <Text style={[styles.quickBtnTitle, { color: palette.textPrimary }]}>
                    Broadcast Notice
                  </Text>
                  <Text style={[styles.quickBtnSub, { color: palette.textMuted }]}>
                    Company announcement
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => onNavigateTab('attendance')}
                  style={[
                    styles.quickBtn,
                    { backgroundColor: palette.inputBg, borderColor: palette.border },
                  ]}
                >
                  <ScanFace size={18} color={palette.emerald} strokeWidth={2.2} />
                  <Text style={[styles.quickBtnTitle, { color: palette.textPrimary }]}>
                    Face Check-In
                  </Text>
                  <Text style={[styles.quickBtnSub, { color: palette.textMuted }]}>
                    Biometric attendance
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handlePayrollRun}
                  disabled={isRunningPayroll}
                  style={[
                    styles.quickBtn,
                    { backgroundColor: palette.inputBg, borderColor: palette.border },
                  ]}
                >
                  <Wallet size={18} color={palette.amber} strokeWidth={2.2} />
                  <Text style={[styles.quickBtnTitle, { color: palette.textPrimary }]}>
                    {isRunningPayroll ? 'Processing...' : 'Run Payroll'}
                  </Text>
                  <Text style={[styles.quickBtnSub, { color: palette.textMuted }]}>
                    {data.kpis.payroll.status}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {/* Pending Approvals Queue (Single-elevation card, hairline dividers) */}
          <View
            style={[
              styles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                Pending Approvals ({pendingApprovals.length})
              </Text>
              <Pressable onPress={() => onNavigateTab('approvals')}>
                <Text style={[styles.linkText, { color: palette.primary }]}>Open Center</Text>
              </Pressable>
            </View>

            {pendingApprovals.length === 0 ? (
              <View style={styles.emptyBox}>
                <CheckCircle2 size={24} color={palette.emerald} strokeWidth={2} />
                <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>
                  No Pending Approval Requests
                </Text>
                <Text style={[styles.emptySub, { color: palette.textMuted }]}>
                  Leave, regularization, and expense requests will appear here in real time.
                </Text>
              </View>
            ) : (
              pendingApprovals.slice(0, 3).map((item, idx) => (
                <View
                  key={item.id}
                  style={[
                    styles.listRow,
                    idx > 0
                      ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                      : null,
                  ]}
                >
                  <View style={styles.listTop}>
                    <View style={styles.listInfo}>
                      <Text style={[styles.listName, { color: palette.textPrimary }]}>
                        {item.employeeName}
                      </Text>
                      <Text style={[styles.listMeta, { color: palette.textMuted }]}>
                        {item.category} · {item.durationOrAmount}
                      </Text>
                    </View>
                    {canManage ? (
                      <View style={styles.actionPair}>
                        <Pressable
                          onPress={() => handleDecision(item.id, 'Approved')}
                          style={[styles.approveBtn, { backgroundColor: palette.primary }]}
                        >
                          <Text style={styles.btnWhiteText}>Approve</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleDecision(item.id, 'Rejected')}
                          style={[
                            styles.rejectBtn,
                            { backgroundColor: palette.inputBg, borderColor: palette.border },
                          ]}
                        >
                          <Text style={[styles.rejectBtnText, { color: palette.textSecondary }]}>
                            Reject
                          </Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Announcements Feed (Single-elevation card, dot-separated metadata) */}
          <View
            style={[
              styles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                Enterprise Announcements ({data.announcements.length})
              </Text>
              {canManage ? (
                <Pressable onPress={onOpenAnnouncement}>
                  <Text style={[styles.linkText, { color: palette.primary }]}>+ Broadcast</Text>
                </Pressable>
              ) : null}
            </View>

            {data.announcements.length === 0 ? (
              <View style={styles.emptyBox}>
                <Megaphone size={24} color={palette.violet} strokeWidth={2} />
                <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>
                  No Active Announcements
                </Text>
                <Text style={[styles.emptySub, { color: palette.textMuted }]}>
                  Tap &ldquo;+ Broadcast&rdquo; to publish an official notice to employees.
                </Text>
              </View>
            ) : (
              data.announcements.map((ann, idx) => (
                <View
                  key={ann.id}
                  style={[
                    styles.listRow,
                    idx > 0
                      ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                      : null,
                  ]}
                >
                  <Text style={[styles.listName, { color: palette.textPrimary }]}>
                    {ann.title}
                  </Text>
                  <Text style={[styles.listMeta, { color: palette.textMuted }]}>
                    {ann.category} · {ann.department} · {ann.priority} Priority
                  </Text>
                  <Text style={[styles.annDesc, { color: palette.textSecondary }]}>
                    {ann.description}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      ) : null}

      {activeHomeTab === 'shifts' ? (
        <ShiftsAndRostersScreen
          mode="shifts"
          shifts={data.shifts}
          rosters={data.rosters}
          isDark={isDark}
          canManage={canManage}
          onSuccessToast={onSuccessToast}
        />
      ) : null}

      {activeHomeTab === 'rosters' ? (
        <ShiftsAndRostersScreen
          mode="rosters"
          shifts={data.shifts}
          rosters={data.rosters}
          isDark={isDark}
          canManage={canManage}
          onSuccessToast={onSuccessToast}
        />
      ) : null}

      {activeHomeTab === 'holidays' ? (
        <HolidayCalendarScreen
          holidays={data.holidays}
          isDark={isDark}
          canManage={canManage}
          onSuccessToast={onSuccessToast}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  tabSegmentBar: {
    flexDirection: 'row',
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    padding: 4, // p-1
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    minHeight: 40, // min-h-[40px]
    flexDirection: 'row',
    gap: 6,
    borderRadius: 12, // rounded-xl
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
  },
  stack: {
    gap: 16,
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
    gap: 6,
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiLabel: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  kpiVal: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.6,
    marginVertical: 2,
  },
  kpiFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  kpiMeta: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    borderRadius: 24, // rounded-3xl
    borderWidth: 1,
    padding: 20, // p-5
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FONT_SANS,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  linkText: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    fontWeight: '600',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  quickBtn: {
    width: '48%',
    flexGrow: 1,
    minHeight: 48, // h-12 touch target
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  quickBtnTitle: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  quickBtnSub: {
    fontFamily: FONT_SANS,
    fontSize: 11,
  },
  emptyBox: {
    paddingVertical: 22,
    alignItems: 'center',
    gap: 6,
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
  },
  listRow: {
    paddingVertical: 14,
  },
  listTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '700',
  },
  listMeta: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    marginTop: 3,
  },
  annDesc: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    marginTop: 6,
  },
  actionPair: {
    flexDirection: 'row',
    gap: 8,
  },
  approveBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnWhiteText: {
    fontFamily: FONT_SANS,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtnText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
  },
});
