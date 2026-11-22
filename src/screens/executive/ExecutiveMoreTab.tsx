import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  ArrowLeft,
  Award,
  CalendarPlus,
  ChevronRight,
  Download,
  FileSpreadsheet,
  LogOut,
  Megaphone,
  Moon,
  ScanFace,
  ShieldCheck,
  Sun,
  User,
  UserCheck,
} from 'lucide-react';
import { FONT_SANS, getPalette } from '../../theme/colors';
import {
  ExecutiveBoardReportItem,
  ExecutiveMoreModuleId,
  ExecutivePortalState,
  formatInrCompact,
} from '@/lib/executive-portal-logic';
import { execSharedStyles, getExecutiveStatusTone } from './ExecutiveSharedStyles';

interface ExecutiveMoreTabProps {
  state: ExecutivePortalState;
  activeModule: ExecutiveMoreModuleId | null;
  isDark: boolean;
  onSelectModule: (mod: ExecutiveMoreModuleId | null) => void;
  onToggleDarkMode: (next: boolean) => void;
  onOpenReportPreview: (report: ExecutiveBoardReportItem) => void;
  onOpenBroadcastModal: () => void;
  onOpenSelfCheckIn: () => void;
  onOpenSelfLeaveModal: () => void;
  onNavigatePersonalPortal: () => void;
  onSaveProfile: (patch: { phone: string; location: string }) => void;
  onLogout: () => void;
}

export function ExecutiveMoreTab({
  state,
  activeModule,
  isDark,
  onSelectModule,
  onToggleDarkMode,
  onOpenReportPreview,
  onOpenBroadcastModal,
  onOpenSelfCheckIn,
  onOpenSelfLeaveModal,
  onNavigatePersonalPortal,
  onSaveProfile,
  onLogout,
}: ExecutiveMoreTabProps) {
  const palette = getPalette(isDark);
  const [editPhone, setEditPhone] = useState(state.profile.phone);
  const [editLocation, setEditLocation] = useState(state.profile.location);

  const hubItems: {
    id: ExecutiveMoreModuleId;
    title: string;
    subtitle: string;
    badge: string;
    color: string;
    Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  }[] = [
    {
      id: 'board_reports',
      title: 'Board & MIS Reports',
      subtitle: 'CSV & PDF packs for board review',
      badge: `${state.boardReports.length} Packs`,
      color: palette.primary,
      Icon: FileSpreadsheet,
    },
    {
      id: 'announcements',
      title: 'Company Announcements',
      subtitle: 'Town halls & C-suite broadcasts',
      badge: `${state.announcements.length} Active`,
      color: palette.amber,
      Icon: Megaphone,
    },
    {
      id: 'scorecards',
      title: 'Department Scorecards',
      subtitle: 'Health, utilization & SLA scores',
      badge: `${state.departments.length} Depts`,
      color: palette.emerald,
      Icon: Award,
    },
    {
      id: 'compliance',
      title: 'Audit & Compliance',
      subtitle: 'Statutory, SOC2 & overtime checks',
      badge: `${state.complianceItems.filter((c) => c.status === 'Compliant').length}/${state.complianceItems.length} OK`,
      color: palette.violet,
      Icon: ShieldCheck,
    },
    {
      id: 'self_service',
      title: 'My Self-Service',
      subtitle: 'Attendance, leaves & payslips',
      badge: state.selfService.todayStatus,
      color: palette.sky,
      Icon: UserCheck,
    },
    {
      id: 'profile',
      title: 'My Profile',
      subtitle: 'Contact, dark mode & sign out',
      badge: state.profile.executiveId,
      color: palette.rose,
      Icon: User,
    },
  ];

  if (!activeModule) {
    return (
      <View style={execSharedStyles.stack}>
        <View
          style={[
            execSharedStyles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.profilePreviewRow}>
            <View style={[styles.avatarCircle, { backgroundColor: palette.primary }]}>
              <Text style={styles.avatarText}>{state.profile.avatarInitials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[execSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
                {state.profile.fullName}
              </Text>
              <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
                {state.profile.designation} · {state.profile.executiveId}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Open Executive Profile"
              onPress={() => onSelectModule('profile')}
              style={[
                execSharedStyles.filterChip,
                { backgroundColor: palette.primaryLight, borderColor: palette.primary },
              ]}
            >
              <Text style={[execSharedStyles.filterChipText, { color: palette.primary }]}>
                Profile
              </Text>
            </Pressable>
          </View>
        </View>

        <View
          style={[
            execSharedStyles.card,
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
                execSharedStyles.listRow,
                idx > 0
                  ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                  : null,
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.hubTitle, { color: palette.textPrimary }]}>
                    {item.title}
                  </Text>
                  <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
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
    <View style={execSharedStyles.stack}>
      <Pressable
        accessibilityLabel="Back to Executive Hub"
        onPress={() => onSelectModule(null)}
        style={[
          styles.backBar,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <ArrowLeft size={16} color={palette.primary} />
        <Text style={[execSharedStyles.linkText, { color: palette.primary }]}>
          Back to Executive Hub
        </Text>
      </Pressable>

      {/* 1. BOARD & MIS REPORTS */}
      {activeModule === 'board_reports' ? (
        <View style={execSharedStyles.stack}>
          {state.boardReports.map((rep) => (
            <View
              key={rep.id}
              style={[
                execSharedStyles.cardCompact,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <View style={execSharedStyles.cardHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[execSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    {rep.title}
                  </Text>
                  <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
                    {rep.subtitle}
                  </Text>
                </View>
                <View
                  style={[
                    execSharedStyles.statusBadge,
                    { backgroundColor: palette.primaryLight },
                  ]}
                >
                  <Text style={[execSharedStyles.statusBadgeText, { color: palette.primary }]}>
                    {rep.ownerLens.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  execSharedStyles.metaText,
                  execSharedStyles.monoText,
                  { color: palette.textMuted, marginBottom: 10 },
                ]}
              >
                {rep.formatLabel} · Updated {rep.lastGenerated}
              </Text>
              <Pressable
                accessibilityLabel={`Export Report ${rep.id}`}
                onPress={() => onOpenReportPreview(rep)}
                style={[execSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
              >
                <Download size={15} color="#FFFFFF" />
                <Text style={execSharedStyles.primaryBtnText}>
                  Export CSV / Board Pack
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      {/* 2. COMPANY ANNOUNCEMENTS */}
      {activeModule === 'announcements' ? (
        <View style={execSharedStyles.stack}>
          <Pressable
            accessibilityLabel="Compose Company Announcement"
            onPress={onOpenBroadcastModal}
            style={[execSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
          >
            <Megaphone size={15} color="#FFFFFF" />
            <Text style={execSharedStyles.primaryBtnText}>
              Broadcast Company Announcement
            </Text>
          </Pressable>

          {state.announcements.map((ann) => {
            const tone = getExecutiveStatusTone(ann.priority, palette);
            return (
              <View
                key={ann.id}
                style={[
                  execSharedStyles.cardCompact,
                  { backgroundColor: palette.surface, borderColor: palette.border },
                ]}
              >
                <View style={execSharedStyles.cardHeaderRow}>
                  <Text
                    style={[
                      execSharedStyles.subTitle,
                      { color: palette.textPrimary, flex: 1 },
                    ]}
                  >
                    {ann.title}
                  </Text>
                  <View style={[execSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                    <Text style={[execSharedStyles.statusBadgeText, { color: tone.text }]}>
                      {ann.priority}
                    </Text>
                  </View>
                </View>
                <Text style={[execSharedStyles.metaText, { color: palette.textSecondary }]}>
                  {ann.body}
                </Text>
                <Text
                  style={[
                    execSharedStyles.metaText,
                    { color: palette.textMuted, marginTop: 8, fontSize: 11 },
                  ]}
                >
                  {ann.audience} · {ann.publishedBy} · {ann.publishedAt}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* 3. DEPARTMENT SCORECARDS */}
      {activeModule === 'scorecards' ? (
        <View style={execSharedStyles.stack}>
          {state.departments.map((dept) => {
            const tone = getExecutiveStatusTone(dept.healthStatus, palette);
            return (
              <View
                key={dept.id}
                style={[
                  execSharedStyles.cardCompact,
                  { backgroundColor: palette.surface, borderColor: palette.border },
                ]}
              >
                <View style={execSharedStyles.cardHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[execSharedStyles.subTitle, { color: palette.textPrimary }]}>
                      {dept.department}
                    </Text>
                    <Text style={[execSharedStyles.metaText, { color: palette.textMuted }]}>
                      Lead: {dept.leadName} · {dept.primaryLocation}
                    </Text>
                  </View>
                  <View style={[execSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                    <Text
                      style={[
                        execSharedStyles.statusBadgeText,
                        execSharedStyles.monoText,
                        { color: tone.text },
                      ]}
                    >
                      {dept.healthScore}/100 · {dept.healthStatus}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    execSharedStyles.metaText,
                    execSharedStyles.monoText,
                    { color: palette.textSecondary },
                  ]}
                >
                  HC {dept.headcount} · Utilization {dept.utilizationPct}% · Att{' '}
                  {dept.attendanceRatePct}% · Attrition {dept.annualizedAttritionPct}%
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* 4. AUDIT & COMPLIANCE SUMMARY */}
      {activeModule === 'compliance' ? (
        <View style={execSharedStyles.stack}>
          {state.complianceItems.map((cmp) => {
            const tone = getExecutiveStatusTone(cmp.status, palette);
            return (
              <View
                key={cmp.id}
                style={[
                  execSharedStyles.cardCompact,
                  { backgroundColor: palette.surface, borderColor: palette.border },
                ]}
              >
                <View style={execSharedStyles.cardHeaderRow}>
                  <Text
                    style={[
                      execSharedStyles.subTitle,
                      { color: palette.textPrimary, flex: 1 },
                    ]}
                  >
                    {cmp.domain}
                  </Text>
                  <View style={[execSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                    <Text
                      style={[
                        execSharedStyles.statusBadgeText,
                        execSharedStyles.monoText,
                        { color: tone.text },
                      ]}
                    >
                      {cmp.scorePct}% · {cmp.status}
                    </Text>
                  </View>
                </View>
                <Text style={[execSharedStyles.metaText, { color: palette.textSecondary }]}>
                  {cmp.note}
                </Text>
                <Text
                  style={[
                    execSharedStyles.metaText,
                    { color: palette.textMuted, marginTop: 6, fontSize: 11 },
                  ]}
                >
                  Owner: {cmp.owner} · Last audited {cmp.lastAudited}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* 5. PERSONAL SELF-SERVICE */}
      {activeModule === 'self_service' ? (
        <View style={execSharedStyles.stack}>
          <View
            style={[
              execSharedStyles.cardCompact,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={execSharedStyles.cardHeaderRow}>
              <Text style={[execSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
                My Executive Self-Service
              </Text>
              <View
                style={[
                  execSharedStyles.statusBadge,
                  { backgroundColor: palette.emeraldBg },
                ]}
              >
                <Text style={[execSharedStyles.statusBadgeText, { color: palette.emerald }]}>
                  {state.selfService.todayStatus}
                </Text>
              </View>
            </View>
            <Text style={[execSharedStyles.metaText, { color: palette.textSecondary }]}>
              Punch-in: {state.selfService.punchInTime} · {state.selfService.shiftName}
            </Text>

            <View style={styles.selfActionRow}>
              <Pressable
                accessibilityLabel="Executive Self Face Check-In"
                onPress={onOpenSelfCheckIn}
                style={[
                  execSharedStyles.primaryBtn,
                  { flex: 1, backgroundColor: palette.primary },
                ]}
              >
                <ScanFace size={15} color="#FFFFFF" />
                <Text style={execSharedStyles.primaryBtnText}>Check In / Out</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Executive Self Apply Leave"
                onPress={onOpenSelfLeaveModal}
                style={[
                  execSharedStyles.secondaryBtn,
                  {
                    flex: 1,
                    backgroundColor: palette.inputBg,
                    borderColor: palette.border,
                  },
                ]}
              >
                <CalendarPlus size={15} color={palette.primary} />
                <Text
                  style={[execSharedStyles.secondaryBtnText, { color: palette.textPrimary }]}
                >
                  Apply Leave
                </Text>
              </Pressable>
            </View>
          </View>

          <View
            style={[
              execSharedStyles.cardCompact,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[execSharedStyles.subTitle, { color: palette.textPrimary, marginBottom: 8 }]}>
              My Leave Balances &amp; Payslips
            </Text>
            {state.selfService.leaveBalances.map((lb) => (
              <View key={lb.key} style={styles.balanceRow}>
                <Text style={[execSharedStyles.metaText, { color: palette.textPrimary }]}>
                  {lb.label}
                </Text>
                <Text
                  style={[
                    execSharedStyles.metaText,
                    execSharedStyles.monoText,
                    { color: palette.primary, fontWeight: '700' },
                  ]}
                >
                  {lb.remaining}/{lb.total} days
                </Text>
              </View>
            ))}

            <View style={{ marginTop: 10, gap: 6 }}>
              {state.selfService.payslips.map((slip) => (
                <View
                  key={slip.id}
                  style={[
                    styles.slipBox,
                    { backgroundColor: palette.inputBg, borderColor: palette.border },
                  ]}
                >
                  <Text style={[execSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    {slip.monthLabel}
                  </Text>
                  <Text
                    style={[
                      execSharedStyles.subTitle,
                      execSharedStyles.monoText,
                      { color: palette.emerald },
                    ]}
                  >
                    {formatInrCompact(slip.netInr)} ({slip.status})
                  </Text>
                </View>
              ))}
            </View>

            <Pressable
              accessibilityLabel="Open Full Employee Self-Service Portal"
              onPress={onNavigatePersonalPortal}
              style={[
                execSharedStyles.secondaryBtn,
                {
                  marginTop: 12,
                  backgroundColor: palette.primaryLight,
                  borderColor: palette.primary,
                },
              ]}
            >
              <Text style={[execSharedStyles.secondaryBtnText, { color: palette.primary }]}>
                Open Full Employee ESS Portal
              </Text>
              <ChevronRight size={14} color={palette.primary} />
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* 6. MY PROFILE */}
      {activeModule === 'profile' ? (
        <View
          style={[
            execSharedStyles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Text style={[execSharedStyles.sectionTitle, { color: palette.textPrimary, marginBottom: 10 }]}>
            Executive Profile &amp; Preferences
          </Text>

          <Text style={[execSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
            Phone Number
          </Text>
          <TextInput
            accessibilityLabel="Executive Profile Phone Input"
            value={editPhone}
            onChangeText={setEditPhone}
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
            Office Location
          </Text>
          <TextInput
            accessibilityLabel="Executive Profile Location Input"
            value={editLocation}
            onChangeText={setEditLocation}
            style={[
              execSharedStyles.input,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.border,
                color: palette.textPrimary,
                marginBottom: 12,
              },
            ]}
          />

          <Pressable
            accessibilityLabel="Save Executive Profile"
            onPress={() => onSaveProfile({ phone: editPhone, location: editLocation })}
            style={[execSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
          >
            <Text style={execSharedStyles.primaryBtnText}>Save Contact Details</Text>
          </Pressable>

          <View
            style={[
              styles.themeRow,
              { borderTopColor: palette.borderSubtle },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {isDark ? (
                <Moon size={16} color={palette.primary} />
              ) : (
                <Sun size={16} color={palette.amber} />
              )}
              <Text style={[execSharedStyles.subTitle, { color: palette.textPrimary }]}>
                Dark Mode Theme
              </Text>
            </View>
            <Switch
              accessibilityLabel="Toggle Executive Dark Mode"
              value={isDark}
              onValueChange={onToggleDarkMode}
            />
          </View>

          <Pressable
            accessibilityLabel="Executive Sign Out Button"
            onPress={onLogout}
            style={[
              execSharedStyles.secondaryBtn,
              {
                marginTop: 14,
                backgroundColor: palette.roseBg,
                borderColor: palette.rose,
              },
            ]}
          >
            <LogOut size={15} color={palette.rose} />
            <Text style={[execSharedStyles.secondaryBtnText, { color: palette.rose }]}>
              Sign Out of OFC360
            </Text>
          </Pressable>
        </View>
      ) : null}
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  hubCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 20,
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
    fontSize: 13,
    fontWeight: '700',
  },
  hubBadge: {
    fontFamily: FONT_SANS,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  backBar: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selfActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  slipBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  themeRow: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
