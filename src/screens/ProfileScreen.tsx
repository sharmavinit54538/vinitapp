import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getPalette, FONT_SANS, FONT_MONO } from '../theme/colors';
import { authClient } from '@/lib/auth-api';
import { HrDashboardDataState } from '@/lib/hr-dashboard-logic';

interface ProfileScreenProps {
  data: HrDashboardDataState;
  isDark: boolean;
  onSuccessToast: (msg: string) => void;
  onLogout?: () => void;
}

export function ProfileScreen({
  data,
  isDark,
  onLogout,
}: ProfileScreenProps) {
  const router = useRouter();
  const palette = getPalette(isDark);
  const profile = data.adminProfile;

  const handleLogoutClick = () => {
    authClient.clearSession();
    void authClient.logout();
    if (onLogout) {
      onLogout();
      return;
    }
    router.push('/login');
  };

  return (
    <View style={styles.stack}>
      {/* HR Identity Card */}
      <View
        style={[
          styles.heroCard,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={styles.profileTopRow}>
          <View style={[styles.avatarCircle, { backgroundColor: palette.primary }]}>
            <Text style={styles.avatarInitials}>AS</Text>
          </View>
          <View style={styles.profileMain}>
            <Text style={[styles.roleMeta, { color: palette.primary }]}>
              HR Admin Profile · <Text style={styles.monoInline}>{profile.employeeId}</Text>
            </Text>
            <Text style={[styles.nameText, { color: palette.textPrimary }]}>
              {profile.name}
            </Text>
            <Text style={[styles.designationText, { color: palette.textSecondary }]}>
              {profile.designation}
            </Text>
          </View>
        </View>

        <View style={[styles.metaGrid, { borderTopColor: palette.borderSubtle }]}>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: palette.textMuted }]}>Work Email</Text>
            <Text style={[styles.metaVal, { color: palette.textPrimary }]}>
              {profile.email}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: palette.textMuted }]}>Department</Text>
            <Text style={[styles.metaVal, { color: palette.textPrimary }]}>
              {profile.department}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: palette.textMuted }]}>Primary Hub</Text>
            <Text style={[styles.metaVal, { color: palette.textPrimary }]}>
              {profile.location}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: palette.textMuted }]}>Access Level</Text>
            <Text style={[styles.metaVal, { color: palette.emerald }]}>
              Verified HR Director
            </Text>
          </View>
        </View>
      </View>

      {/* Compact Logout Button */}
      <Pressable
        accessibilityLabel="Logout"
        onPress={handleLogoutClick}
        style={[
          styles.logoutActionBtn,
          {
            backgroundColor: isDark ? 'rgba(244,63,94,0.14)' : '#FFF1F2',
            borderColor: palette.rose,
          },
        ]}
      >
        <LogOut size={14} color={palette.rose} strokeWidth={2.3} />
        <Text style={[styles.logoutActionText, { color: palette.rose }]}>
          Logout
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 16,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: FONT_SANS,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  profileMain: {
    flex: 1,
  },
  roleMeta: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
  },
  monoInline: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
  },
  nameText: {
    fontFamily: FONT_SANS,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  designationText: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    marginTop: 2,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  metaItem: {
    width: '47%',
  },
  metaLabel: {
    fontFamily: FONT_SANS,
    fontSize: 11,
    fontWeight: '600',
  },
  metaVal: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  logoutActionBtn: {
    alignSelf: 'flex-start',
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  logoutActionText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '700',
  },
});
