import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { X } from 'lucide-react';
import { getPalette, FONT_SANS, FONT_MONO } from '../theme/colors';
import {
  useAddWorkforceEmployeeMutation,
  usePublishAnnouncementMutation,
} from '@/lib/store/hr-api';
import {
  addEmployeeFormSchema,
  announcementFormSchema,
  AnnouncementItem,
  AnnouncementPriority,
  WORKFORCE_EMPLOYEE_ROLES,
  WorkforceEmployeeRole,
} from '@/lib/hr-dashboard-logic';

interface AddEmployeeModalProps {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

const DEPARTMENTS = [
  'Engineering',
  'Product & Design',
  'Sales & Growth',
  'People Operations',
  'Finance & Legal',
  'Customer Success',
];

const SHIFTS = [
  'General Shift (09:30 - 18:30)',
  'Morning Shift (06:00 - 15:00)',
  'Night Shift (21:00 - 06:00)',
  'Flexible Shift',
];

export function AddEmployeeModal({
  visible,
  isDark,
  onClose,
  onSuccessToast,
}: AddEmployeeModalProps) {
  const palette = getPalette(isDark);
  const [addEmployee, { isLoading }] = useAddWorkforceEmployeeMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [role, setRole] = useState<WorkforceEmployeeRole>('Employee');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Bengaluru · Global HQ');
  const [shift, setShift] = useState(SHIFTS[0]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async () => {
    setErrorMsg(null);
    const parsed = addEmployeeFormSchema.safeParse({
      name,
      email,
      phone,
      designation,
      role,
      department,
      location,
      shift,
    });

    if (!parsed.success) {
      const firstErr = parsed.error.issues[0]?.message || 'Please check all required fields.';
      setErrorMsg(firstErr);
      return;
    }

    try {
      await addEmployee(parsed.data).unwrap();
      onSuccessToast(`${parsed.data.name} (${parsed.data.role}) onboarded to ${parsed.data.department}`);
      setName('');
      setEmail('');
      setPhone('');
      setDesignation('');
      setRole('Employee');
      onClose();
    } catch {
      setErrorMsg('Failed to onboard employee. Please try again.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: palette.overlay }]}>
        <View style={[styles.sheet, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <View style={styles.handleWrap}>
            <View style={[styles.handleBar, { backgroundColor: palette.handleBar }]} />
          </View>

          <View style={[styles.headerRow, { borderBottomColor: palette.border }]}>
            <View style={styles.headerTextWrap}>
              <Text style={[styles.sheetTitle, { color: palette.textPrimary }]}>
                Onboard Workforce Employee
              </Text>
              <Text style={[styles.sheetSubtitle, { color: palette.textMuted }]}>
                Create a new employee profile in OFC360 Directory
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: palette.surfaceMuted }]}
            >
              <X size={16} color={palette.textSecondary} strokeWidth={2.3} />
            </Pressable>
          </View>

          <ScrollView style={styles.formBody} showsVerticalScrollIndicator={false}>
            {errorMsg ? (
              <View style={[styles.errorBox, { backgroundColor: palette.roseBg, borderColor: palette.rose }]}>
                <Text style={[styles.errorText, { color: palette.rose }]}>{errorMsg}</Text>
              </View>
            ) : null}

            <Text style={[styles.label, { color: palette.textSecondary }]}>Full Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Rohan Verma"
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

            <Text style={[styles.label, { color: palette.textSecondary }]}>Work Email *</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="rohan.verma@ofc360.com"
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

            <View style={styles.twoCol}>
              <View style={styles.colItem}>
                <Text style={[styles.label, { color: palette.textSecondary }]}>Mobile Phone *</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="+91 98201 11223"
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
              <View style={styles.colItem}>
                <Text style={[styles.label, { color: palette.textSecondary }]}>Designation *</Text>
                <TextInput
                  value={designation}
                  onChangeText={setDesignation}
                  placeholder="Senior Engineer"
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
              </View>
            </View>

            <Text style={[styles.label, { color: palette.textSecondary }]}>Role *</Text>
            <View
              style={[
                styles.segmentedWrap,
                { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
              ]}
            >
              {WORKFORCE_EMPLOYEE_ROLES.map((r) => {
                const active = role === r;
                return (
                  <Pressable
                    key={r}
                    accessibilityRole="button"
                    accessibilityLabel={`Role ${r}`}
                    onPress={() => setRole(r)}
                    style={[
                      styles.chip,
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
                      {r}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.label, { color: palette.textSecondary }]}>Department</Text>
            <View
              style={[
                styles.segmentedWrap,
                { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
              ]}
            >
              {DEPARTMENTS.map((dept) => {
                const active = department === dept;
                return (
                  <Pressable
                    key={dept}
                    onPress={() => setDepartment(dept)}
                    style={[
                      styles.chip,
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
                      {dept}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.label, { color: palette.textSecondary }]}>Office Location *</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Bengaluru · Global HQ"
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

            <Text style={[styles.label, { color: palette.textSecondary }]}>Assigned Shift</Text>
            <View
              style={[
                styles.segmentedWrap,
                { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
              ]}
            >
              {SHIFTS.map((s) => {
                const active = shift === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => setShift(s)}
                    style={[
                      styles.chip,
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
                      {s}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={[styles.footerRow, { borderTopColor: palette.border }]}>
            <Pressable
              onPress={onClose}
              style={[styles.secondaryBtn, { borderColor: palette.border, backgroundColor: palette.inputBg }]}
            >
              <Text style={[styles.secondaryBtnText, { color: palette.textSecondary }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={isLoading}
              style={[styles.primaryBtn, { backgroundColor: palette.primary }]}
            >
              <Text style={styles.primaryBtnText}>
                {isLoading ? 'Onboarding...' : 'Add Employee'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface AnnouncementModalProps {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

const CATEGORIES: AnnouncementItem['category'][] = [
  'Company News',
  'Policy Update',
  'Payroll & Benefits',
  'Events',
  'IT & Security',
];

const PRIORITIES: AnnouncementPriority[] = ['Normal', 'High', 'Urgent'];

export function AnnouncementModal({
  visible,
  isDark,
  onClose,
  onSuccessToast,
}: AnnouncementModalProps) {
  const palette = getPalette(isDark);
  const [publishAnnouncement, { isLoading }] = usePublishAnnouncementMutation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('High');
  const [category, setCategory] = useState<AnnouncementItem['category']>('Company News');
  const [department, setDepartment] = useState('All Departments');
  const [targetAudience, setTargetAudience] = useState('All Employees');
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePublish = async () => {
    setErrorMsg(null);
    const parsed = announcementFormSchema.safeParse({
      title,
      description,
      priority,
      category,
      targetAudience,
      department,
      expiryDate,
    });

    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message || 'Please check announcement fields.');
      return;
    }

    try {
      await publishAnnouncement({
        ...parsed.data,
        status: 'Published',
      }).unwrap();
      onSuccessToast('Enterprise announcement broadcasted');
      setTitle('');
      setDescription('');
      onClose();
    } catch {
      setErrorMsg('Failed to broadcast announcement.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: palette.overlay }]}>
        <View style={[styles.sheet, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <View style={styles.handleWrap}>
            <View style={[styles.handleBar, { backgroundColor: palette.handleBar }]} />
          </View>

          <View style={[styles.headerRow, { borderBottomColor: palette.border }]}>
            <View style={styles.headerTextWrap}>
              <Text style={[styles.sheetTitle, { color: palette.textPrimary }]}>
                Broadcast Enterprise Notice
              </Text>
              <Text style={[styles.sheetSubtitle, { color: palette.textMuted }]}>
                Push instant notification to employee mobile devices
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: palette.surfaceMuted }]}
            >
              <X size={16} color={palette.textSecondary} strokeWidth={2.3} />
            </Pressable>
          </View>

          <ScrollView style={styles.formBody} showsVerticalScrollIndicator={false}>
            {errorMsg ? (
              <View style={[styles.errorBox, { backgroundColor: palette.roseBg, borderColor: palette.rose }]}>
                <Text style={[styles.errorText, { color: palette.rose }]}>{errorMsg}</Text>
              </View>
            ) : null}

            <Text style={[styles.label, { color: palette.textSecondary }]}>Announcement Title *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Q4 Townhall & Annual Bonus Schedule"
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

            <Text style={[styles.label, { color: palette.textSecondary }]}>Priority Level</Text>
            <View
              style={[
                styles.segmentedWrap,
                { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
              ]}
            >
              {PRIORITIES.map((p) => {
                const active = priority === p;
                return (
                  <Pressable
                    key={p}
                    onPress={() => setPriority(p)}
                    style={[
                      styles.chip,
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
                      {p}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.label, { color: palette.textSecondary }]}>Category</Text>
            <View
              style={[
                styles.segmentedWrap,
                { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
              ]}
            >
              {CATEGORIES.map((cat) => {
                const active = category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.chip,
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
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.twoCol}>
              <View style={styles.colItem}>
                <Text style={[styles.label, { color: palette.textSecondary }]}>Department</Text>
                <TextInput
                  value={department}
                  onChangeText={setDepartment}
                  placeholder="All Departments"
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
              </View>
              <View style={styles.colItem}>
                <Text style={[styles.label, { color: palette.textSecondary }]}>Expiry Date</Text>
                <TextInput
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  placeholder="YYYY-MM-DD"
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

            <Text style={[styles.label, { color: palette.textSecondary }]}>Target Audience</Text>
            <TextInput
              value={targetAudience}
              onChangeText={setTargetAudience}
              placeholder="All Employees"
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

            <Text style={[styles.label, { color: palette.textSecondary }]}>Message Details *</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholder="Write the official announcement message here..."
              placeholderTextColor={palette.textMuted}
              style={[
                styles.textArea,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                },
              ]}
            />
          </ScrollView>

          <View style={[styles.footerRow, { borderTopColor: palette.border }]}>
            <Pressable
              onPress={onClose}
              style={[styles.secondaryBtn, { borderColor: palette.border, backgroundColor: palette.inputBg }]}
            >
              <Text style={[styles.secondaryBtnText, { color: palette.textSecondary }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handlePublish}
              disabled={isLoading}
              style={[styles.primaryBtn, { backgroundColor: palette.primary }]}
            >
              <Text style={styles.primaryBtnText}>
                {isLoading ? 'Publishing...' : 'Publish Notice'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    borderTopLeftRadius: 24, // rounded-3xl
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handleBar: {
    width: 40, // w-10
    height: 6, // h-1.5
    borderRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  sheetTitle: {
    fontFamily: FONT_SANS,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formBody: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  errorBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  errorText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    fontFamily: FONT_SANS,
    height: 48, // h-12 touch hitbox
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  monoInput: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
    height: 48, // h-12 touch hitbox
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  textArea: {
    fontFamily: FONT_SANS,
    minHeight: 96,
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 10,
  },
  colItem: {
    flex: 1,
  },
  segmentedWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4, // p-1
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    gap: 4,
  },
  chip: {
    minHeight: 40, // min-h-[40px]
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12, // rounded-xl
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    marginTop: 8,
    borderTopWidth: 1,
  },
  secondaryBtn: {
    flex: 1,
    height: 48, // h-12 touch target
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryBtn: {
    flex: 1.5,
    height: 48, // h-12 touch target
    borderRadius: 16, // rounded-2xl
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: FONT_SANS,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
