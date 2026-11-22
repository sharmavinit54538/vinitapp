import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  ArrowLeft,
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  FileBadge2,
  History,
  LogOut,
  Megaphone,
  Moon,
  PackageCheck,
  PlugZap,
  RefreshCw,
  ScanFace,
  Search,
  ShieldOff,
  Sun,
  User,
  UserCheck,
} from 'lucide-react';
import { computePayslipTotals } from '@/lib/employee-portal-logic';
import { FONT_MONO, FONT_SANS, getPalette } from '../../theme/colors';
import {
  ItAdminMoreModuleId,
  ItAdminPortalState,
  ItAuditLogItem,
} from '@/lib/it-admin-portal-logic';
import { getItAdminStatusTone, itSharedStyles } from './ItAdminSharedStyles';

interface ItAdminMoreTabProps {
  state: ItAdminPortalState;
  activeModule: ItAdminMoreModuleId | null;
  isDark: boolean;
  onSelectModule: (mod: ItAdminMoreModuleId | null) => void;
  onToggleDarkMode: (next: boolean) => void;
  onConfirmExitAssetReturn: (clearanceId: string, assetId: string) => void;
  onToggleClearanceAccessStep: (
    clearanceId: string,
    step: 'ssoRevoked' | 'emailArchived' | 'badgeDeactivated'
  ) => void;
  onSignOffClearance: (clearanceId: string) => { valid: boolean; error?: string };
  onTestIntegrationSync: (integrationId: string) => void;
  onOpenSelfCheckIn: () => void;
  onOpenSelfLeaveModal: () => void;
  onNavigatePersonalPortal: () => void;
  onSaveProfile: (patch: { phone: string; location: string }) => void;
  onLogout: () => void;
}

export function ItAdminMoreTab({
  state,
  activeModule,
  isDark,
  onSelectModule,
  onToggleDarkMode,
  onConfirmExitAssetReturn,
  onToggleClearanceAccessStep,
  onSignOffClearance,
  onTestIntegrationSync,
  onOpenSelfCheckIn,
  onOpenSelfLeaveModal,
  onNavigatePersonalPortal,
  onSaveProfile,
  onLogout,
}: ItAdminMoreTabProps) {
  const palette = getPalette(isDark);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditCategory, setAuditCategory] = useState<'All' | ItAuditLogItem['category']>('All');
  const [clearanceError, setClearanceError] = useState<string | null>(null);
  const [editPhone, setEditPhone] = useState(state.profile.phone);
  const [editLocation, setEditLocation] = useState(state.profile.location);

  const filteredLogs = useMemo(() => {
    const q = auditSearch.trim().toLowerCase();
    return state.auditLogs.filter((l) => {
      if (auditCategory !== 'All' && l.category !== auditCategory) return false;
      if (!q) return true;
      return (
        l.action.toLowerCase().includes(q) ||
        l.target.toLowerCase().includes(q) ||
        l.actorName.toLowerCase().includes(q)
      );
    });
  }, [state.auditLogs, auditSearch, auditCategory]);

  const pendingExitsCount = state.offboardingClearances.filter(
    (c) => c.clearanceStatus === 'Pending IT Clearance'
  ).length;

  const hubItems: {
    id: ItAdminMoreModuleId;
    title: string;
    subtitle: string;
    badge: string;
    color: string;
    Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  }[] = [
    {
      id: 'offboarding',
      title: 'Offboarding IT Clearance',
      subtitle: 'Collect hardware & revoke SSO',
      badge: `${pendingExitsCount} Pending`,
      color: palette.rose,
      Icon: PackageCheck,
    },
    {
      id: 'audit_logs',
      title: 'System Audit Logs',
      subtitle: 'RBAC, asset & security trail',
      badge: `${state.auditLogs.length} Events`,
      color: palette.primary,
      Icon: History,
    },
    {
      id: 'integrations',
      title: 'Integrations & Webhooks',
      subtitle: 'Okta, Workspace, MDM, Bio',
      badge: `${state.integrations.length} Connected`,
      color: palette.emerald,
      Icon: PlugZap,
    },
    {
      id: 'self_service',
      title: 'My Self-Service',
      subtitle: 'Face check-in, leaves & payslips',
      badge: state.selfService.todayStatus,
      color: palette.sky,
      Icon: UserCheck,
    },
    {
      id: 'announcements',
      title: 'Announcements',
      subtitle: 'Company broadcasts',
      badge: `${state.announcements.length} Notices`,
      color: palette.amber,
      Icon: Megaphone,
    },
    {
      id: 'profile',
      title: 'My Profile',
      subtitle: 'Contact, theme & sign out',
      badge: state.profile.itAdminId,
      color: palette.violet,
      Icon: User,
    },
  ];

  if (!activeModule) {
    return (
      <View style={itSharedStyles.stack}>
        <View
          style={[
            itSharedStyles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.profilePreviewRow}>
            <View style={[styles.avatarCircle, { backgroundColor: palette.primary }]}>
              <Text style={styles.avatarText}>{state.profile.avatarInitials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[itSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
                {state.profile.fullName}
              </Text>
              <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
                {state.profile.designation} · {state.profile.itAdminId}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Open IT Admin Profile"
              onPress={() => onSelectModule('profile')}
              style={[
                itSharedStyles.filterChip,
                { backgroundColor: palette.primaryLight, borderColor: palette.primary },
              ]}
            >
              <Text style={[itSharedStyles.filterChipText, { color: palette.primary }]}>
                Edit
              </Text>
            </Pressable>
          </View>
        </View>

        <View
          style={[
            itSharedStyles.card,
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
                itSharedStyles.listRow,
                idx > 0
                  ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                  : null,
              ]}
            >
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.hubTitle, { color: palette.textPrimary }]}>
                    {item.title}
                  </Text>
                  <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
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
    <View style={itSharedStyles.stack}>
      <Pressable
        accessibilityLabel="Back to IT Admin Hub"
        onPress={() => {
          setClearanceError(null);
          onSelectModule(null);
        }}
        style={[
          styles.backBar,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <ArrowLeft size={16} color={palette.primary} />
        <Text style={[itSharedStyles.linkText, { color: palette.primary }]}>
          Back to IT Admin Hub
        </Text>
      </Pressable>

      {/* 1. OFFBOARDING IT CLEARANCE */}
      {activeModule === 'offboarding' ? (
        <View style={itSharedStyles.stack}>
          {clearanceError ? (
            <View
              style={[
                itSharedStyles.errorBanner,
                { backgroundColor: palette.roseBg, borderColor: palette.rose },
              ]}
            >
              <Text style={[itSharedStyles.errorBannerText, { color: palette.rose }]}>
                {clearanceError}
              </Text>
            </View>
          ) : null}

          {state.offboardingClearances.map((clr) => {
            const tone = getItAdminStatusTone(clr.clearanceStatus, palette);
            return (
              <View
                key={clr.id}
                style={[
                  itSharedStyles.card,
                  { backgroundColor: palette.surface, borderColor: palette.border },
                ]}
              >
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={[itSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
                      {clr.fullName} ({clr.employeeId})
                    </Text>
                    <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
                      {clr.department} · Last Working Day {clr.lastWorkingDay}
                    </Text>
                  </View>
                  <View style={[itSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                    <Text style={[itSharedStyles.statusBadgeText, { color: tone.text }]}>
                      {clr.clearanceStatus}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    itSharedStyles.fieldLabel,
                    { color: palette.textSecondary, marginTop: 12 },
                  ]}
                >
                  Assigned Hardware Recovery ({clr.returnedAssetIds.length}/
                  {clr.assignedAssetIds.length})
                </Text>
                <View style={styles.checkStack}>
                  {clr.assignedAssetIds.map((assetId, idx) => {
                    const returned = clr.returnedAssetIds.includes(assetId);
                    const label = clr.assignedAssetLabels[idx] || assetId;
                    return (
                      <Pressable
                        key={assetId}
                        accessibilityLabel={`Recover Exit Asset ${assetId}`}
                        disabled={returned || clr.clearanceStatus === 'Cleared'}
                        onPress={() => {
                          setClearanceError(null);
                          onConfirmExitAssetReturn(clr.id, assetId);
                        }}
                        style={[
                          styles.checkRow,
                          {
                            backgroundColor: returned ? palette.emeraldBg : palette.inputBg,
                            borderColor: returned ? palette.emerald : palette.border,
                          },
                        ]}
                      >
                        <CheckCircle2
                          size={16}
                          color={returned ? palette.emerald : palette.textMuted}
                        />
                        <Text
                          style={[
                            itSharedStyles.subTitle,
                            {
                              flex: 1,
                              color: returned ? palette.emerald : palette.textPrimary,
                            },
                          ]}
                        >
                          {label}
                        </Text>
                        <Text
                          style={[
                            itSharedStyles.metaText,
                            { color: returned ? palette.emerald : palette.primary, fontWeight: '700' },
                          ]}
                        >
                          {returned ? 'Returned' : 'Mark Returned'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text
                  style={[
                    itSharedStyles.fieldLabel,
                    { color: palette.textSecondary, marginTop: 14 },
                  ]}
                >
                  Access Revocation Checklist
                </Text>
                <View style={styles.checkStack}>
                  {[
                    {
                      key: 'ssoRevoked' as const,
                      label: 'Revoke Okta SSO & App Tokens',
                      done: clr.ssoRevoked,
                    },
                    {
                      key: 'emailArchived' as const,
                      label: 'Suspend & Archive Corporate Email',
                      done: clr.emailArchived,
                    },
                    {
                      key: 'badgeDeactivated' as const,
                      label: 'Deactivate RFID & Biometric Access',
                      done: clr.badgeDeactivated,
                    },
                  ].map((step) => (
                    <Pressable
                      key={step.key}
                      accessibilityLabel={`Toggle Exit Step ${step.key}`}
                      disabled={clr.clearanceStatus === 'Cleared'}
                      onPress={() => {
                        setClearanceError(null);
                        onToggleClearanceAccessStep(clr.id, step.key);
                      }}
                      style={[
                        styles.checkRow,
                        {
                          backgroundColor: step.done ? palette.emeraldBg : palette.inputBg,
                          borderColor: step.done ? palette.emerald : palette.border,
                        },
                      ]}
                    >
                      <ShieldOff
                        size={16}
                        color={step.done ? palette.emerald : palette.textMuted}
                      />
                      <Text
                        style={[
                          itSharedStyles.subTitle,
                          {
                            flex: 1,
                            color: step.done ? palette.emerald : palette.textPrimary,
                          },
                        ]}
                      >
                        {step.label}
                      </Text>
                      <Text
                        style={[
                          itSharedStyles.metaText,
                          { color: step.done ? palette.emerald : palette.primary, fontWeight: '700' },
                        ]}
                      >
                        {step.done ? 'Revoked' : 'Revoke'}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {clr.clearanceStatus === 'Pending IT Clearance' ? (
                  <Pressable
                    accessibilityLabel={`Sign Off IT Clearance ${clr.employeeId}`}
                    onPress={() => {
                      const res = onSignOffClearance(clr.id);
                      if (!res.valid) {
                        setClearanceError(
                          res.error || 'Complete all asset & revocation steps first.'
                        );
                      } else {
                        setClearanceError(null);
                      }
                    }}
                    style={[
                      itSharedStyles.primaryBtn,
                      { backgroundColor: palette.primary, marginTop: 14 },
                    ]}
                  >
                    <Text style={itSharedStyles.primaryBtnText}>
                      Sign Off IT Department Clearance
                    </Text>
                  </Pressable>
                ) : (
                  <Text
                    style={[
                      itSharedStyles.metaText,
                      { color: palette.emerald, fontWeight: '700', marginTop: 12 },
                    ]}
                  >
                    IT Clearance signed off by {clr.signedOffBy} on {clr.signedOffAt}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      ) : null}

      {/* 2. SYSTEM AUDIT LOGS */}
      {activeModule === 'audit_logs' ? (
        <View style={itSharedStyles.stack}>
          <View
            style={[
              itSharedStyles.cardCompact,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View
              style={[
                styles.searchWrap,
                { backgroundColor: palette.inputBg, borderColor: palette.border },
              ]}
            >
              <Search size={15} color={palette.textMuted} />
              <TextInput
                accessibilityLabel="Search System Audit Logs"
                value={auditSearch}
                onChangeText={setAuditSearch}
                placeholder="Search action, target, or actor..."
                placeholderTextColor={palette.textMuted}
                style={[styles.searchInput, { color: palette.textPrimary }]}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {(
                ['All', 'Asset', 'Access & RBAC', 'Security', 'Clearance', 'Helpdesk'] as const
              ).map((cat) => {
                const active = auditCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    accessibilityLabel={`Audit Filter ${cat}`}
                    onPress={() => setAuditCategory(cat)}
                    style={[
                      itSharedStyles.filterChip,
                      {
                        backgroundColor: active ? palette.primaryLight : palette.inputBg,
                        borderColor: active ? palette.primary : palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        itSharedStyles.filterChipText,
                        { color: active ? palette.primary : palette.textSecondary },
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {filteredLogs.map((log) => {
            const sevTone = getItAdminStatusTone(log.severity, palette);
            return (
              <View
                key={log.id}
                style={[
                  itSharedStyles.cardCompact,
                  { backgroundColor: palette.surface, borderColor: palette.border },
                ]}
              >
                <View style={styles.rowBetween}>
                  <Text style={[itSharedStyles.subTitle, { color: palette.textPrimary, flex: 1 }]}>
                    {log.action}
                  </Text>
                  <View style={[itSharedStyles.statusBadge, { backgroundColor: sevTone.bg }]}>
                    <Text style={[itSharedStyles.statusBadgeText, { color: sevTone.text }]}>
                      {log.category}
                    </Text>
                  </View>
                </View>
                <Text style={[itSharedStyles.metaText, { color: palette.textSecondary, marginTop: 4 }]}>
                  Target: {log.target}
                </Text>
                <Text
                  style={[
                    itSharedStyles.metaText,
                    itSharedStyles.monoText,
                    { color: palette.textMuted, marginTop: 2 },
                  ]}
                >
                  Actor: {log.actorName} · {log.timestamp}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* 3. INTEGRATIONS & WEBHOOKS */}
      {activeModule === 'integrations' ? (
        <View style={itSharedStyles.stack}>
          {state.integrations.map((intg) => {
            const tone = getItAdminStatusTone(intg.status, palette);
            return (
              <View
                key={intg.id}
                style={[
                  itSharedStyles.cardCompact,
                  { backgroundColor: palette.surface, borderColor: palette.border },
                ]}
              >
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={[itSharedStyles.subTitle, { color: palette.textPrimary }]}>
                      {intg.name}
                    </Text>
                    <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
                      {intg.category} · {intg.endpointOrTenant}
                    </Text>
                  </View>
                  <View style={[itSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                    <Text style={[itSharedStyles.statusBadgeText, { color: tone.text }]}>
                      {intg.status}
                    </Text>
                  </View>
                </View>
                <View style={[styles.rowBetween, { marginTop: 10 }]}>
                  <Text
                    style={[
                      itSharedStyles.metaText,
                      itSharedStyles.monoText,
                      { color: palette.textMuted },
                    ]}
                  >
                    Last sync: {intg.lastSyncedAt}
                  </Text>
                  <Pressable
                    accessibilityLabel={`Sync Integration ${intg.id}`}
                    onPress={() => onTestIntegrationSync(intg.id)}
                    style={[
                      itSharedStyles.filterChip,
                      {
                        flexDirection: 'row',
                        gap: 5,
                        backgroundColor: palette.primaryLight,
                        borderColor: palette.primary,
                      },
                    ]}
                  >
                    <RefreshCw size={12} color={palette.primary} />
                    <Text style={[itSharedStyles.filterChipText, { color: palette.primary }]}>
                      Sync Now
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* 4. IT ADMIN SELF-SERVICE (ATTENDANCE, LEAVES, PAYSLIPS, DOCUMENTS) */}
      {activeModule === 'self_service' ? (
        <View style={itSharedStyles.stack}>
          <View
            style={[
              itSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={styles.rowBetween}>
              <View>
                <Text style={[itSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
                  My Attendance Today
                </Text>
                <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
                  {state.selfService.todayStatus} ·{' '}
                  {state.selfService.checkInTime
                    ? `In ${state.selfService.checkInTime}`
                    : 'Not punched in'}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Open IT Admin Self Check-In"
                onPress={onOpenSelfCheckIn}
                style={[itSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
              >
                <ScanFace size={15} color="#FFFFFF" />
                <Text style={itSharedStyles.primaryBtnText}>
                  {state.selfService.todayStatus === 'Checked In'
                    ? 'Face Out'
                    : 'Face Check-In'}
                </Text>
              </Pressable>
            </View>
          </View>

          <View
            style={[
              itSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={itSharedStyles.cardHeaderRow}>
              <Text style={[itSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
                My Leave Balances
              </Text>
              <Pressable
                accessibilityLabel="Apply IT Admin Personal Leave"
                onPress={onOpenSelfLeaveModal}
                style={[
                  itSharedStyles.filterChip,
                  {
                    flexDirection: 'row',
                    gap: 4,
                    backgroundColor: palette.primaryLight,
                    borderColor: palette.primary,
                  },
                ]}
              >
                <CalendarPlus size={14} color={palette.primary} />
                <Text style={[itSharedStyles.filterChipText, { color: palette.primary }]}>
                  Apply Leave
                </Text>
              </Pressable>
            </View>

            <View style={styles.statRow}>
              {state.selfService.leaveBalances.map((b) => (
                <View
                  key={b.key}
                  style={[styles.statBox, { backgroundColor: palette.inputBg }]}
                >
                  <Text style={[styles.statVal, { color: palette.textPrimary }]}>
                    {b.remaining}
                  </Text>
                  <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
                    {b.code}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {state.selfService.payslips[0] ? (
            <View
              style={[
                itSharedStyles.card,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <Text style={[itSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
                My Latest Payslip ({state.selfService.payslips[0].monthLabel})
              </Text>
              <Text
                style={[
                  itSharedStyles.metaText,
                  itSharedStyles.monoText,
                  { color: palette.emerald, marginTop: 4, fontWeight: '700' },
                ]}
              >
                Net Pay: ₹
                {computePayslipTotals(state.selfService.payslips[0]).netPay.toLocaleString('en-IN')}{' '}
                · {state.selfService.payslips[0].bankAccountMasked}
              </Text>

              <Pressable
                accessibilityLabel="Open Full Employee Self-Service Portal"
                onPress={onNavigatePersonalPortal}
                style={[
                  itSharedStyles.secondaryBtn,
                  {
                    backgroundColor: palette.inputBg,
                    borderColor: palette.border,
                    marginTop: 12,
                  },
                ]}
              >
                <FileBadge2 size={15} color={palette.primary} />
                <Text style={[itSharedStyles.secondaryBtnText, { color: palette.primary }]}>
                  Open Full ESS Portal (Payslips &amp; Docs)
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* 5. ANNOUNCEMENTS */}
      {activeModule === 'announcements' ? (
        <View style={itSharedStyles.stack}>
          {state.announcements.map((ann) => (
            <View
              key={ann.id}
              style={[
                itSharedStyles.cardCompact,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <Text style={[itSharedStyles.subTitle, { color: palette.textPrimary }]}>
                {ann.title}
              </Text>
              <Text style={[itSharedStyles.metaText, { color: palette.textMuted, marginTop: 2 }]}>
                {ann.category} · {ann.department} · {ann.publishedDate}
              </Text>
              <Text style={[itSharedStyles.metaText, { color: palette.textSecondary, marginTop: 6 }]}>
                {ann.description}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* 6. MY PROFILE & SIGN OUT */}
      {activeModule === 'profile' ? (
        <View style={itSharedStyles.stack}>
          <View
            style={[
              itSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[itSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
              IT Admin Profile
            </Text>
            <Text style={[itSharedStyles.metaText, { color: palette.textMuted, marginBottom: 12 }]}>
              {state.profile.email} · {state.profile.department}
            </Text>

            <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Direct Contact Phone
            </Text>
            <TextInput
              accessibilityLabel="IT Admin Phone Input"
              value={editPhone}
              onChangeText={setEditPhone}
              style={[
                itSharedStyles.input,
                itSharedStyles.monoText,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                },
              ]}
            />

            <Text
              style={[
                itSharedStyles.fieldLabel,
                { color: palette.textSecondary, marginTop: 10 },
              ]}
            >
              NOC / Office Hub Location
            </Text>
            <TextInput
              accessibilityLabel="IT Admin Location Input"
              value={editLocation}
              onChangeText={setEditLocation}
              style={[
                itSharedStyles.input,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                },
              ]}
            />

            <Pressable
              accessibilityLabel="Save IT Admin Profile"
              onPress={() =>
                onSaveProfile({
                  phone: editPhone.trim(),
                  location: editLocation.trim(),
                })
              }
              style={[
                itSharedStyles.primaryBtn,
                { backgroundColor: palette.primary, marginTop: 14 },
              ]}
            >
              <Text style={itSharedStyles.primaryBtnText}>Save Profile Changes</Text>
            </Pressable>
          </View>

          <View
            style={[
              itSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {isDark ? (
                  <Moon size={18} color={palette.primary} />
                ) : (
                  <Sun size={18} color={palette.amber} />
                )}
                <View>
                  <Text style={[itSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    Appearance Theme
                  </Text>
                  <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
                    {isDark ? 'Dark mode enabled' : 'Light mode enabled'}
                  </Text>
                </View>
              </View>
              <Switch
                accessibilityLabel="Toggle IT Admin Dark Mode"
                value={isDark}
                onValueChange={onToggleDarkMode}
              />
            </View>

            <Pressable
              accessibilityLabel="Sign Out of IT Admin Portal"
              onPress={onLogout}
              style={[
                itSharedStyles.secondaryBtn,
                {
                  backgroundColor: palette.roseBg,
                  borderColor: palette.rose,
                  marginTop: 14,
                },
              ]}
            >
              <LogOut size={16} color={palette.rose} />
              <Text style={[itSharedStyles.secondaryBtnText, { color: palette.rose }]}>
                Sign Out
              </Text>
            </Pressable>
          </View>
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
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  hubCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 22,
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
    fontSize: 14,
    fontWeight: '700',
  },
  hubBadge: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  backBar: {
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  checkStack: {
    gap: 8,
  },
  checkRow: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchWrap: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT_SANS,
    fontSize: 13,
    paddingVertical: 8,
  },
  filterScroll: {
    gap: 8,
    paddingRight: 8,
  },
  statRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 2,
  },
  statVal: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
    fontSize: 18,
    fontWeight: '700',
  },
});
