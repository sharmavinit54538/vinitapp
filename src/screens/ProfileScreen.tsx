import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getPalette, FONT_SANS, FONT_MONO } from '../theme/colors';
import { authClient } from '@/lib/auth-api';
import {
  HrDashboardDataState,
  ProfileCrudRecord,
  createInitialProfileRecords,
  upsertProfileRecord,
  deleteProfileRecord,
} from '@/lib/hr-dashboard-logic';

interface ProfileScreenProps {
  data: HrDashboardDataState;
  isDark: boolean;
  onSuccessToast: (msg: string) => void;
  onLogout?: () => void;
}

const CATEGORIES: ProfileCrudRecord['category'][] = [
  'Personal',
  'Emergency',
  'Certification',
  'Financial',
];

export function ProfileScreen({
  data,
  isDark,
  onSuccessToast,
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

  const [records, setRecords] = useState<ProfileCrudRecord[]>(() =>
    createInitialProfileRecords()
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProfileCrudRecord['category']>('Personal');
  const [value, setValue] = useState('');

  const openAddRecord = () => {
    setEditingId(undefined);
    setTitle('');
    setCategory('Personal');
    setValue('');
    setIsModalOpen(true);
  };

  const openEditRecord = (rec: ProfileCrudRecord) => {
    setEditingId(rec.id);
    setTitle(rec.title);
    setCategory(rec.category);
    setValue(rec.value);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() || !value.trim()) return;
    setRecords((prev) =>
      upsertProfileRecord(prev, {
        id: editingId,
        title,
        category,
        value,
        status: 'Verified',
      })
    );
    setIsModalOpen(false);
    onSuccessToast(editingId ? 'HR Profile record updated' : 'HR Profile record added');
  };

  const handleDelete = (id: string) => {
    setRecords((prev) => deleteProfileRecord(prev, id));
    onSuccessToast('Record removed from HR profile');
  };

  return (
    <View style={styles.stack}>
      {/* HR Identity Card (rounded-3xl p-5, clean dot-separated metadata) */}
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

      {/* HR Personal Credentials & Records (Single-elevation card, hairline dividers) */}
      <View
        style={[
          styles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerTextCol}>
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
              HR Personal Dossier & Records
            </Text>
            <Text style={[styles.sectionSub, { color: palette.textMuted }]}>
              Verified personal, emergency & certification records
            </Text>
          </View>
          <Pressable
            onPress={openAddRecord}
            style={[styles.addBtn, { backgroundColor: palette.primary }]}
          >
            <Text style={styles.addBtnText}>+ Add Record</Text>
          </Pressable>
        </View>

        {records.map((rec, idx) => (
          <View
            key={rec.id}
            style={[
              styles.recordRow,
              idx > 0
                ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                : null,
            ]}
          >
            <View style={styles.recordTop}>
              <View style={styles.recordInfo}>
                <Text style={[styles.recordCat, { color: palette.textMuted }]}>
                  {rec.category} · {rec.status}
                </Text>
                <Text style={[styles.recordTitle, { color: palette.textPrimary }]}>
                  {rec.title}
                </Text>
                <Text style={[styles.recordVal, { color: palette.textSecondary }]}>
                  {rec.value}
                </Text>
              </View>
              <View style={styles.recordActions}>
                <Pressable onPress={() => openEditRecord(rec)}>
                  <Text style={[styles.actionLink, { color: palette.primary }]}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => handleDelete(rec.id)}>
                  <Text style={[styles.actionLink, { color: palette.rose }]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Prominent Logout / Sign Out Action Card */}
      <Pressable
        accessibilityLabel="Sign Out of Account"
        onPress={handleLogoutClick}
        style={[
          styles.logoutActionBtn,
          {
            backgroundColor: isDark ? 'rgba(244,63,94,0.14)' : '#FFF1F2',
            borderColor: palette.rose,
          },
        ]}
      >
        <LogOut size={18} color={palette.rose} strokeWidth={2.3} />
        <Text style={[styles.logoutActionText, { color: palette.rose }]}>
          Logout / Sign Out of Session
        </Text>
      </Pressable>

      {/* Add / Edit Record Bottom Sheet */}
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
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
              {editingId ? 'Edit HR Record' : 'Add HR Profile Record'}
            </Text>

            <Text style={[styles.inputLabel, { color: palette.textSecondary }]}>Category</Text>
            <View
              style={[
                styles.segmentedBar,
                { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
              ]}
            >
              {CATEGORIES.map((c) => {
                const active = category === c;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setCategory(c)}
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
                      {c}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.inputLabel, { color: palette.textSecondary }]}>Title *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Emergency Contact"
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

            <Text style={[styles.inputLabel, { color: palette.textSecondary }]}>Details *</Text>
            <TextInput
              value={value}
              onChangeText={setValue}
              placeholder="e.g., +91 98201 44110"
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

            <View style={styles.btnRow}>
              <Pressable
                onPress={() => setIsModalOpen(false)}
                style={[
                  styles.cancelBtn,
                  { backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <Text style={[styles.cancelText, { color: palette.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                style={[styles.saveBtn, { backgroundColor: palette.primary }]}
              >
                <Text style={styles.addBtnText}>Save Record</Text>
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
  card: {
    borderRadius: 24, // rounded-3xl
    borderWidth: 1,
    padding: 20, // p-5
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  headerTextCol: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: FONT_SANS,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    marginTop: 2,
  },
  addBtn: {
    paddingHorizontal: 14,
    height: 48, // h-12 touch target
    borderRadius: 16, // rounded-2xl
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontFamily: FONT_SANS,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  recordRow: {
    paddingVertical: 14,
  },
  recordTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  recordInfo: {
    flex: 1,
  },
  recordCat: {
    fontFamily: FONT_SANS,
    fontSize: 11,
    fontWeight: '600',
  },
  recordTitle: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  recordVal: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
    fontSize: 12,
    marginTop: 2,
  },
  recordActions: {
    flexDirection: 'row',
    gap: 14,
  },
  actionLink: {
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
  inputLabel: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  segmentedBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4, // p-1
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    gap: 4,
  },
  segmentChip: {
    flex: 1,
    minHeight: 40, // min-h-[40px]
    paddingHorizontal: 10,
    borderRadius: 12, // rounded-xl
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    fontFamily: FONT_SANS,
    height: 48, // h-12 touch target
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
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
  saveBtn: {
    flex: 1.5,
    height: 48, // h-12
    borderRadius: 16, // rounded-2xl
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutActionBtn: {
    height: 50,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutActionText: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '700',
  },
});
