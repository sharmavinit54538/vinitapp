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
  KeyRound,
  LogOut,
  Plus,
  ScanFace,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Ofc360Role } from '@/lib/auth-schemas';
import { FONT_SANS, getPalette } from '../../theme/colors';
import {
  ItNewJoinerSetupItem,
  ItSecurityPolicyConfig,
  ItUserAccount,
} from '@/lib/it-admin-portal-logic';
import { getItAdminStatusTone, itSharedStyles } from './ItAdminSharedStyles';

interface ItAdminAccessTabProps {
  users: ItUserAccount[];
  newJoiners: ItNewJoinerSetupItem[];
  securityPolicy: ItSecurityPolicyConfig;
  isDark: boolean;
  onOpenProvisionModal: () => void;
  onToggleJoinerStep: (
    joinerId: string,
    step: 'emailCreated' | 'ssoProvisioned' | 'biometricSynced' | 'hardwareIssued'
  ) => void;
  onCompleteJoinerSetup: (joinerId: string) => void;
  onChangeUserRole: (userId: string, role: Ofc360Role) => void;
  onToggleUserStatus: (userId: string) => void;
  onForcePasswordReset: (userId: string) => void;
  onRevokeUserSessions: (userId: string) => void;
  onUpdateSecurityPolicy: (patch: Partial<ItSecurityPolicyConfig>) => void;
}

const ASSIGNABLE_ROLES: { role: Ofc360Role; label: string }[] = [
  { role: 'employee', label: 'Employee' },
  { role: 'manager', label: 'Manager' },
  { role: 'hr_admin', label: 'HR Admin' },
  { role: 'it_admin', label: 'IT Admin' },
  { role: 'executive', label: 'Executive' },
];

export function ItAdminAccessTab({
  users,
  newJoiners,
  securityPolicy,
  isDark,
  onOpenProvisionModal,
  onToggleJoinerStep,
  onCompleteJoinerSetup,
  onChangeUserRole,
  onToggleUserStatus,
  onForcePasswordReset,
  onRevokeUserSessions,
  onUpdateSecurityPolicy,
}: ItAdminAccessTabProps) {
  const palette = getPalette(isDark);
  const [subView, setSubView] = useState<'users' | 'joiners' | 'security'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [ipDraft, setIpDraft] = useState(securityPolicy.allowedIpCidrs);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.employeeId.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  return (
    <View style={itSharedStyles.stack}>
      {/* Sub-module Switcher */}
      <View
        style={[
          itSharedStyles.cardCompact,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={itSharedStyles.cardHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={[itSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
              Users, RBAC &amp; Security
            </Text>
            <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
              Provision accounts, manage roles, 2FA &amp; active sessions
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Provision New User"
            onPress={onOpenProvisionModal}
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
            <Plus size={14} color={palette.primary} />
            <Text style={[itSharedStyles.filterChipText, { color: palette.primary }]}>
              Provision
            </Text>
          </Pressable>
        </View>

        <View style={styles.switchRow}>
          {[
            { id: 'users' as const, label: `Users & RBAC (${users.length})` },
            {
              id: 'joiners' as const,
              label: `New Joiners (${newJoiners.filter((j) => j.status === 'Pending Setup').length})`,
            },
            { id: 'security' as const, label: '2FA & IP Policy' },
          ].map((tab) => {
            const active = subView === tab.id;
            return (
              <Pressable
                key={tab.id}
                accessibilityLabel={`Access Subtab ${tab.label}`}
                onPress={() => setSubView(tab.id)}
                style={[
                  itSharedStyles.filterChip,
                  {
                    flexGrow: 1,
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
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 1. USERS & RBAC DIRECTORY */}
      {subView === 'users' ? (
        <View style={itSharedStyles.stack}>
          <View
            style={[
              styles.searchWrap,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Search size={15} color={palette.textMuted} />
            <TextInput
              accessibilityLabel="Search Users and Roles"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search name, email, employee ID, or role..."
              placeholderTextColor={palette.textMuted}
              style={[styles.searchInput, { color: palette.textPrimary }]}
            />
          </View>

          {filteredUsers.map((user) => {
            const tone = getItAdminStatusTone(user.accountStatus, palette);
            return (
              <View
                key={user.id}
                style={[
                  itSharedStyles.cardCompact,
                  { backgroundColor: palette.surface, borderColor: palette.border },
                ]}
              >
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.userTitle, { color: palette.textPrimary }]}>
                      {user.fullName}
                    </Text>
                    <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
                      {user.email} · {user.employeeId}
                    </Text>
                  </View>
                  <View style={[itSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                    <Text style={[itSharedStyles.statusBadgeText, { color: tone.text }]}>
                      {user.accountStatus}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    itSharedStyles.metaText,
                    itSharedStyles.monoText,
                    { color: palette.textSecondary, marginTop: 6 },
                  ]}
                >
                  2FA: {user.mfaEnabled ? 'Enforced' : 'Off'} · Face Bio:{' '}
                  {user.biometricEnrolled ? 'Synced' : 'Pending'} · Sessions:{' '}
                  {user.activeSessionsCount}
                </Text>

                {user.forcePasswordResetPending ? (
                  <Text style={[itSharedStyles.metaText, { color: palette.amber, marginTop: 3 }]}>
                    Force password reset queued for next login
                  </Text>
                ) : null}

                {/* Role Switcher */}
                <Text
                  style={[
                    itSharedStyles.fieldLabel,
                    { color: palette.textMuted, marginTop: 10, marginBottom: 4 },
                  ]}
                >
                  Assigned RBAC Role
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.roleScroll}
                >
                  {ASSIGNABLE_ROLES.map((r) => {
                    const active = user.role === r.role;
                    return (
                      <Pressable
                        key={r.role}
                        accessibilityLabel={`Set Role ${r.label} for ${user.employeeId}`}
                        onPress={() => onChangeUserRole(user.id, r.role)}
                        style={[
                          itSharedStyles.filterChip,
                          {
                            minHeight: 32,
                            paddingHorizontal: 10,
                            backgroundColor: active ? palette.primary : palette.inputBg,
                            borderColor: active ? palette.primary : palette.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            itSharedStyles.filterChipText,
                            {
                              fontSize: 11,
                              color: active ? '#FFFFFF' : palette.textSecondary,
                            },
                          ]}
                        >
                          {r.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <View style={styles.actionsWrap}>
                  <Pressable
                    accessibilityLabel={`${
                      user.accountStatus === 'Active' ? 'Suspend' : 'Activate'
                    } User ${user.employeeId}`}
                    onPress={() => onToggleUserStatus(user.id)}
                    style={[
                      styles.miniBtn,
                      {
                        backgroundColor:
                          user.accountStatus === 'Active'
                            ? palette.roseBg
                            : palette.emeraldBg,
                      },
                    ]}
                  >
                    {user.accountStatus === 'Active' ? (
                      <UserX size={13} color={palette.rose} />
                    ) : (
                      <UserCheck size={13} color={palette.emerald} />
                    )}
                    <Text
                      style={[
                        styles.miniBtnText,
                        {
                          color:
                            user.accountStatus === 'Active'
                              ? palette.rose
                              : palette.emerald,
                        },
                      ]}
                    >
                      {user.accountStatus === 'Active' ? 'Suspend' : 'Reactivate'}
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityLabel={`Force Password Reset ${user.employeeId}`}
                    onPress={() => onForcePasswordReset(user.id)}
                    style={[styles.miniBtn, { backgroundColor: palette.amberBg }]}
                  >
                    <KeyRound size={13} color={palette.amber} />
                    <Text style={[styles.miniBtnText, { color: palette.amber }]}>
                      Force Reset
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityLabel={`Revoke Sessions ${user.employeeId}`}
                    onPress={() => onRevokeUserSessions(user.id)}
                    style={[styles.miniBtn, { backgroundColor: palette.inputBg }]}
                  >
                    <LogOut size={13} color={palette.textSecondary} />
                    <Text style={[styles.miniBtnText, { color: palette.textSecondary }]}>
                      Revoke ({user.activeSessionsCount})
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* 2. NEW JOINER IT SETUP */}
      {subView === 'joiners' ? (
        <View style={itSharedStyles.stack}>
          {newJoiners.map((j) => {
            const tone = getItAdminStatusTone(j.status, palette);
            const steps: {
              key: 'emailCreated' | 'ssoProvisioned' | 'biometricSynced' | 'hardwareIssued';
              label: string;
              done: boolean;
            }[] = [
              { key: 'emailCreated', label: 'Create Work Email', done: j.emailCreated },
              { key: 'ssoProvisioned', label: 'Okta SSO & Apps', done: j.ssoProvisioned },
              {
                key: 'biometricSynced',
                label: 'Push Face/Bio Enrollment',
                done: j.biometricSynced,
              },
              { key: 'hardwareIssued', label: 'Assign Hardware Kit', done: j.hardwareIssued },
            ];
            return (
              <View
                key={j.id}
                style={[
                  itSharedStyles.cardCompact,
                  { backgroundColor: palette.surface, borderColor: palette.border },
                ]}
              >
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.userTitle, { color: palette.textPrimary }]}>
                      {j.fullName} · {j.employeeId}
                    </Text>
                    <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
                      {j.designation} ({j.department}) · DOJ {j.joiningDate}
                    </Text>
                    <Text
                      style={[
                        itSharedStyles.metaText,
                        itSharedStyles.monoText,
                        { color: palette.primary, marginTop: 2 },
                      ]}
                    >
                      {j.officialEmail}
                    </Text>
                  </View>
                  <View style={[itSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                    <Text style={[itSharedStyles.statusBadgeText, { color: tone.text }]}>
                      {j.status}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    itSharedStyles.metaText,
                    { color: palette.textSecondary, marginTop: 6, marginBottom: 8 },
                  ]}
                >
                  Hardware Kit: {j.requestedHardware}
                </Text>

                <View style={styles.stepGrid}>
                  {steps.map((st) => (
                    <Pressable
                      key={st.key}
                      accessibilityLabel={`${j.employeeId} ${st.label}`}
                      onPress={() => onToggleJoinerStep(j.id, st.key)}
                      style={[
                        styles.stepPill,
                        {
                          backgroundColor: st.done ? palette.emeraldBg : palette.inputBg,
                          borderColor: st.done ? palette.emerald : palette.border,
                        },
                      ]}
                    >
                      {st.key === 'biometricSynced' ? (
                        <ScanFace
                          size={13}
                          color={st.done ? palette.emerald : palette.textMuted}
                        />
                      ) : (
                        <ShieldCheck
                          size={13}
                          color={st.done ? palette.emerald : palette.textMuted}
                        />
                      )}
                      <Text
                        style={[
                          styles.miniBtnText,
                          { color: st.done ? palette.emerald : palette.textSecondary },
                        ]}
                      >
                        {st.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {j.status === 'Pending Setup' ? (
                  <Pressable
                    accessibilityLabel={`Complete Joiner Setup ${j.employeeId}`}
                    onPress={() => onCompleteJoinerSetup(j.id)}
                    style={[
                      itSharedStyles.primaryBtn,
                      { backgroundColor: palette.primary, marginTop: 12 },
                    ]}
                  >
                    <Text style={itSharedStyles.primaryBtnText}>
                      Activate Account &amp; Complete IT Setup
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}

      {/* 3. SECURITY & SESSION GOVERNANCE */}
      {subView === 'security' ? (
        <View style={itSharedStyles.stack}>
          <View
            style={[
              itSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[itSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
              2FA / MFA &amp; Session Governance
            </Text>
            <Text
              style={[
                itSharedStyles.metaText,
                { color: palette.textMuted, marginTop: 2, marginBottom: 14 },
              ]}
            >
              Enforce authentication standards across OFC360 web &amp; mobile clients
            </Text>

            <View style={[styles.policyRow, { borderBottomColor: palette.borderSubtle }]}>
              <View style={{ flex: 1 }}>
                <Text style={[itSharedStyles.subTitle, { color: palette.textPrimary }]}>
                  Enforce MFA for All Employees
                </Text>
                <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
                  Require TOTP or passkey verification on every new device
                </Text>
              </View>
              <Switch
                accessibilityLabel="Toggle Enforce MFA All Users"
                value={securityPolicy.enforceMfaAllUsers}
                onValueChange={(v) => onUpdateSecurityPolicy({ enforceMfaAllUsers: v })}
              />
            </View>

            <View style={[styles.policyRow, { borderBottomColor: palette.borderSubtle }]}>
              <View style={{ flex: 1 }}>
                <Text style={[itSharedStyles.subTitle, { color: palette.textPrimary }]}>
                  Strict IP Allowlist for Admin Consoles
                </Text>
                <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
                  Restrict privileged RBAC portals to HQ VPN CIDRs
                </Text>
              </View>
              <Switch
                accessibilityLabel="Toggle IP Allowlist"
                value={securityPolicy.ipAllowlistEnabled}
                onValueChange={(v) => onUpdateSecurityPolicy({ ipAllowlistEnabled: v })}
              />
            </View>

            <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 12 }]}>
              Minimum Password Length
            </Text>
            <View style={[itSharedStyles.chipRow, { marginBottom: 12 }]}>
              {([8, 12, 14] as const).map((len) => {
                const active = securityPolicy.minPasswordLength === len;
                return (
                  <Pressable
                    key={len}
                    accessibilityLabel={`Set Min Password ${len}`}
                    onPress={() => onUpdateSecurityPolicy({ minPasswordLength: len })}
                    style={[
                      itSharedStyles.filterChip,
                      {
                        flex: 1,
                        backgroundColor: active ? palette.primaryLight : palette.inputBg,
                        borderColor: active ? palette.primary : palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        itSharedStyles.filterChipText,
                        itSharedStyles.monoText,
                        { color: active ? palette.primary : palette.textSecondary },
                      ]}
                    >
                      {len} chars
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Allowed Corporate IP CIDRs
            </Text>
            <TextInput
              accessibilityLabel="Allowed IP CIDRs Input"
              value={ipDraft}
              onChangeText={setIpDraft}
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
            <Pressable
              accessibilityLabel="Save Security Policy"
              onPress={() => onUpdateSecurityPolicy({ allowedIpCidrs: ipDraft.trim() })}
              style={[
                itSharedStyles.primaryBtn,
                { backgroundColor: palette.primary, marginTop: 12 },
              ]}
            >
              <Text style={itSharedStyles.primaryBtnText}>Save Security Policy</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchWrap: {
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
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
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  userTitle: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '700',
  },
  roleScroll: {
    gap: 6,
    paddingRight: 8,
  },
  actionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  miniBtn: {
    minHeight: 36,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  miniBtnText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '700',
  },
  stepGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stepPill: {
    width: '48%',
    flexGrow: 1,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
});
