'use client';

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import {
  Plus,
  ChevronDown,
  MoreVertical,
  Users,
  Building2,
  Network,
  UserPlus,
} from 'lucide-react';
import { Toaster } from 'sonner';
import { getPalette, FONT_SANS, FONT_MONO } from '../theme/colors';
import {
  WorkforceEmployee,
  DepartmentAttendanceMetric,
} from '@/lib/hr-dashboard-logic';
import { EmployeesTable } from '@/src/features/admin/employees/components/EmployeesTable';
import { DepartmentsDirectoryTab } from '@/src/features/admin/departments/components/DepartmentsDirectoryTab';

interface WorkforceScreenProps {
  workforce: WorkforceEmployee[];
  departments: DepartmentAttendanceMetric[];
  isDark: boolean;
  canManage: boolean;
  onOpenAddEmployee: () => void;
  onSuccessToast: (msg: string) => void;
}

type WorkforceSubView = 'Employee' | 'Department' | 'Org Chart';

export function WorkforceScreen({
  workforce,
  departments,
  isDark,
  canManage,
  onOpenAddEmployee,
}: WorkforceScreenProps) {
  const palette = getPalette(isDark);

  const [subView, setSubView] = useState<WorkforceSubView>('Employee');
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);

  const totalDepts = useMemo(() => departments.length, [departments]);

  return (
    <View style={styles.stack}>
      <Toaster position="top-right" richColors />

      {/* Workforce Header Card (rounded-3xl p-5, single-elevation) */}
      <View
        style={[
          styles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.titleCol}>
            <Text style={[styles.eyebrow, { color: palette.textMuted }]}>
              Workforce Directory · {subView}
            </Text>
            <Text style={[styles.title, { color: palette.textPrimary }]}>
              {subView === 'Employee'
                ? `Employees (${workforce.length})`
                : subView === 'Department'
                ? `Departments (${totalDepts})`
                : 'Enterprise Org Chart'}
            </Text>
          </View>

          <View style={styles.actionsRow}>
            {canManage ? (
              <Pressable
                onPress={() => setIsAddDropdownOpen(true)}
                style={[styles.addBtn, { backgroundColor: palette.primary }]}
              >
                <Plus size={16} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.addBtnText}>Add</Text>
                <ChevronDown size={14} color="#FFFFFF" strokeWidth={2.3} />
              </Pressable>
            ) : null}

            <Pressable
              accessibilityLabel="Switch Workforce View"
              onPress={() => setIsViewMenuOpen(true)}
              style={[
                styles.threeDotBtn,
                { backgroundColor: palette.inputBg, borderColor: palette.border },
              ]}
            >
              <MoreVertical size={18} color={palette.textPrimary} strokeWidth={2.2} />
            </Pressable>
          </View>
        </View>

        {/* Sub-view switcher pills for quick navigation */}
        <View
          style={[
            styles.segmentedBar,
            { backgroundColor: palette.surfaceMuted, borderColor: palette.border, marginBottom: 16 },
          ]}
        >
          {(['Employee', 'Department', 'Org Chart'] as const).map((tab) => {
            const active = subView === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setSubView(tab)}
                style={[
                  styles.segmentItem,
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
                    styles.segmentText,
                    { color: active ? palette.primary : palette.textMuted },
                  ]}
                >
                  {tab === 'Employee'
                    ? 'Employees Directory'
                    : tab === 'Department'
                    ? 'Departments & Hierarchy'
                    : 'Org Chart'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {subView === 'Employee' ? (
          <View style={styles.sectionContent}>
            <EmployeesTable />
          </View>
        ) : null}

        {subView === 'Department' ? (
          <View style={styles.sectionContent}>
            <DepartmentsDirectoryTab />
          </View>
        ) : null}

        {subView === 'Org Chart' ? (
          <View style={styles.orgChartWrap}>
            <View
              style={[
                styles.orgNode,
                { backgroundColor: palette.inputBg, borderColor: palette.border },
              ]}
            >
              <Network size={22} color={palette.primary} strokeWidth={2.2} />
              <Text style={[styles.orgRole, { color: palette.primary }]}>
                Principal HR Operations Director
              </Text>
              <Text style={[styles.orgName, { color: palette.textPrimary }]}>
                Aarav Sharma · <Text style={styles.monoInline}>EMP-3600</Text>
              </Text>
              <Text style={[styles.empMeta, { color: palette.textMuted }]}>
                People Operations · Bengaluru Global HQ
              </Text>
            </View>
            <Text style={[styles.emptySub, { color: palette.textMuted, marginTop: 12 }]}>
              <Text style={styles.monoInline}>{workforce.length}</Text> Direct & Matrix Reports Connected
            </Text>
          </View>
        ) : null}
      </View>

      {/* + ADD BOTTOM SHEET (Add Employee / Add Department) */}
      <Modal
        visible={isAddDropdownOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddDropdownOpen(false)}
      >
        <Pressable
          onPress={() => setIsAddDropdownOpen(false)}
          style={[styles.sheetBackdrop, { backgroundColor: palette.overlay }]}
        >
          <View
            style={[
              styles.bottomSheet,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={styles.handleWrap}>
              <View style={[styles.handleBar, { backgroundColor: palette.handleBar }]} />
            </View>
            <Text style={[styles.sheetHeader, { color: palette.textPrimary }]}>
              Create Workforce Record
            </Text>
            <Pressable
              onPress={() => {
                setIsAddDropdownOpen(false);
                onOpenAddEmployee();
              }}
              style={[styles.sheetItem, { backgroundColor: palette.inputBg, borderColor: palette.border }]}
            >
              <UserPlus size={18} color={palette.primary} strokeWidth={2.2} />
              <View style={styles.menuItemCol}>
                <Text style={[styles.menuItemTitle, { color: palette.textPrimary }]}>
                  Add Employee
                </Text>
                <Text style={[styles.menuItemSub, { color: palette.textMuted }]}>
                  Onboard a new full-time or contract employee
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => {
                setIsAddDropdownOpen(false);
                setSubView('Department');
              }}
              style={[styles.sheetItem, { backgroundColor: palette.inputBg, borderColor: palette.border }]}
            >
              <Building2 size={18} color={palette.emerald} strokeWidth={2.2} />
              <View style={styles.menuItemCol}>
                <Text style={[styles.menuItemTitle, { color: palette.textPrimary }]}>
                  Manage Departments &amp; Bulk Import
                </Text>
                <Text style={[styles.menuItemSub, { color: palette.textMuted }]}>
                  Switch to Department Directory to add units or bulk import CSV
                </Text>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* 3-DOT VIEW SWITCHER BOTTOM SHEET */}
      <Modal
        visible={isViewMenuOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsViewMenuOpen(false)}
      >
        <Pressable
          onPress={() => setIsViewMenuOpen(false)}
          style={[styles.sheetBackdrop, { backgroundColor: palette.overlay }]}
        >
          <View
            style={[
              styles.bottomSheet,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={styles.handleWrap}>
              <View style={[styles.handleBar, { backgroundColor: palette.handleBar }]} />
            </View>
            <Text style={[styles.sheetHeader, { color: palette.textPrimary }]}>
              Switch Workforce View
            </Text>
            {(
              [
                { id: 'Employee', Icon: Users },
                { id: 'Department', Icon: Building2 },
                { id: 'Org Chart', Icon: Network },
              ] as const
            ).map((v) => {
              const active = subView === v.id;
              const VIcon = v.Icon;
              return (
                <Pressable
                  key={v.id}
                  onPress={() => {
                    setSubView(v.id);
                    setIsViewMenuOpen(false);
                  }}
                  style={[
                    styles.sheetItem,
                    {
                      backgroundColor: active ? palette.primaryLight : palette.inputBg,
                      borderColor: active ? palette.primary : palette.border,
                    },
                  ]}
                >
                  <VIcon
                    size={18}
                    color={active ? palette.primary : palette.textSecondary}
                    strokeWidth={2.2}
                  />
                  <Text
                    style={[
                      styles.menuItemTitle,
                      { color: active ? palette.primary : palette.textPrimary },
                    ]}
                  >
                    {v.id}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 16,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleCol: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontFamily: FONT_SANS,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtn: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontFamily: FONT_SANS,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  threeDotBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContent: {
    gap: 12,
  },
  segmentedBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  segmentItem: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
  },
  emptySub: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    textAlign: 'center',
  },
  empMeta: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    marginTop: 2,
  },
  monoInline: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
  },
  orgChartWrap: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  orgNode: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
    gap: 4,
  },
  orgRole: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  orgName: {
    fontFamily: FONT_SANS,
    fontSize: 16,
    fontWeight: '700',
  },
  sheetBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 10,
  },
  handleWrap: {
    alignItems: 'center',
    paddingBottom: 6,
  },
  handleBar: {
    width: 40,
    height: 6,
    borderRadius: 3,
  },
  sheetHeader: {
    fontFamily: FONT_SANS,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sheetItem: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  menuItemCol: {
    flex: 1,
  },
  menuItemTitle: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '600',
  },
  menuItemSub: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    marginTop: 2,
  },
});
