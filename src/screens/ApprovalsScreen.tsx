import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import {
  MoreVertical,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { getPalette, FONT_SANS, FONT_MONO } from '../theme/colors';
import {
  ApprovalItem,
  ApprovalCategory,
  ApprovalStatus,
  filterApprovals,
} from '@/lib/hr-dashboard-logic';
import { useDecideApprovalMutation } from '@/lib/store/hr-api';

interface ApprovalsScreenProps {
  approvals: ApprovalItem[];
  isDark: boolean;
  canManage: boolean;
  onSuccessToast: (msg: string) => void;
}

const CATEGORIES: (ApprovalCategory | 'All')[] = [
  'All',
  'Leave Requests',
  'Attendance Regularizations',
  'Expense Claims',
];

export function ApprovalsScreen({
  approvals,
  isDark,
  canManage,
  onSuccessToast,
}: ApprovalsScreenProps) {
  const palette = getPalette(isDark);
  const [decideApproval] = useDecideApprovalMutation();

  const [category, setCategory] = useState<ApprovalCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'All'>('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const filtered = filterApprovals(approvals, category, statusFilter, searchQuery);

  const handleDecision = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await decideApproval({ id, status }).unwrap();
      onSuccessToast(`Request ${status.toLowerCase()}`);
    } catch {
      onSuccessToast('Action failed');
    }
  };

  return (
    <View style={styles.stack}>
      <View
        style={[
          styles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.titleCol}>
            <Text style={[styles.eyebrow, { color: palette.textMuted }]}>
              Workflow Approvals Center
            </Text>
            <Text style={[styles.title, { color: palette.textPrimary }]}>
              {category === 'All' ? 'All Approval Requests' : category}
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Filter Approvals by Category"
            onPress={() => setIsCategoryMenuOpen(true)}
            style={[
              styles.threeDotBtn,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <MoreVertical size={18} color={palette.textPrimary} strokeWidth={2.2} />
          </Pressable>
        </View>

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search request by employee, ID, or reason..."
          placeholderTextColor={palette.textMuted}
          style={[
            styles.searchInput,
            {
              backgroundColor: palette.inputBg,
              borderColor: palette.border,
              color: palette.textPrimary,
            },
          ]}
        />

        {/* Segmented Control (p-1 rounded-2xl bg-slate-100/90 with active white/indigo-600 rounded-xl min-h-[40px]) */}
        <View
          style={[
            styles.segmentedBar,
            { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
          ]}
        >
          {(['Pending', 'Approved', 'Rejected', 'All'] as const).map((st) => {
            const active = statusFilter === st;
            return (
              <Pressable
                key={st}
                onPress={() => setStatusFilter(st)}
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
                    { color: active ? palette.primary : palette.textMuted },
                  ]}
                >
                  {st}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <ClipboardCheck size={28} color={palette.emerald} strokeWidth={2} />
            <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>
              <Text style={styles.monoInline}>0</Text> {statusFilter === 'All' ? '' : statusFilter} Requests
            </Text>
            <Text style={[styles.emptySub, { color: palette.textMuted }]}>
              No approval items match the current filter. All queues are clear.
            </Text>
          </View>
        ) : (
          filtered.map((item, idx) => (
            <View
              key={item.id}
              style={[
                styles.itemRow,
                idx > 0
                  ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                  : null,
              ]}
            >
              <View style={styles.itemTop}>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: palette.textPrimary }]}>
                    {item.employeeName} · <Text style={styles.monoInline}>{item.employeeId}</Text>
                  </Text>
                  <Text style={[styles.itemMeta, { color: palette.textMuted }]}>
                    {item.category} · {item.requestType} · <Text style={styles.monoInline}>{item.durationOrAmount}</Text>
                  </Text>
                  <Text style={[styles.itemReason, { color: palette.textSecondary }]}>
                    {item.reason}
                  </Text>
                </View>
                {canManage && item.status === 'Pending' ? (
                  <View style={styles.actionRow}>
                    <Pressable
                      onPress={() => handleDecision(item.id, 'Approved')}
                      style={[styles.approveBtn, { backgroundColor: palette.primary }]}
                    >
                      <CheckCircle2 size={14} color="#FFFFFF" />
                      <Text style={styles.approveText}>Approve</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDecision(item.id, 'Rejected')}
                      style={[
                        styles.rejectBtn,
                        { backgroundColor: palette.inputBg, borderColor: palette.border },
                      ]}
                    >
                      <XCircle size={14} color={palette.rose} />
                      <Text style={[styles.rejectText, { color: palette.rose }]}>Reject</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </View>
          ))
        )}
      </View>

      {/* 3-DOT CATEGORY FILTER BOTTOM SHEET */}
      <Modal
        visible={isCategoryMenuOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCategoryMenuOpen(false)}
      >
        <Pressable
          onPress={() => setIsCategoryMenuOpen(false)}
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
            <Text style={[styles.menuHeader, { color: palette.textPrimary }]}>
              Filter Approval Category
            </Text>
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => {
                    setCategory(cat);
                    setIsCategoryMenuOpen(false);
                  }}
                  style={[
                    styles.menuItem,
                    {
                      backgroundColor: active ? palette.primaryLight : palette.inputBg,
                      borderColor: active ? palette.primary : palette.border,
                    },
                  ]}
                >
                  <ClipboardCheck
                    size={17}
                    color={active ? palette.primary : palette.textSecondary}
                    strokeWidth={2.2}
                  />
                  <Text
                    style={[
                      styles.menuItemText,
                      { color: active ? palette.primary : palette.textPrimary },
                    ]}
                  >
                    {cat === 'All' ? 'All Request Categories' : cat}
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
    borderRadius: 24, // rounded-3xl
    borderWidth: 1,
    padding: 20, // p-5
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
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
  threeDotBtn: {
    width: 48, // h-12 touch target
    height: 48,
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    fontFamily: FONT_SANS,
    height: 48, // h-12 touch target
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
    marginBottom: 12,
  },
  segmentedBar: {
    flexDirection: 'row',
    padding: 4, // p-1
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    gap: 4,
    marginBottom: 12,
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
  emptyBox: {
    paddingVertical: 28,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontFamily: FONT_SANS,
    fontSize: 15,
    fontWeight: '700',
  },
  emptySub: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    textAlign: 'center',
  },
  monoInline: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
  },
  itemRow: {
    paddingVertical: 14,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '700',
  },
  itemMeta: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    marginTop: 2,
  },
  itemReason: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  approveBtn: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  approveText: {
    fontFamily: FONT_SANS,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectBtn: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  rejectText: {
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
    gap: 10,
  },
  handleWrap: {
    alignItems: 'center',
    paddingBottom: 6,
  },
  handleBar: {
    width: 40, // w-10
    height: 6, // h-1.5
    borderRadius: 3,
  },
  menuHeader: {
    fontFamily: FONT_SANS,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  menuItem: {
    minHeight: 48, // h-12
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
  },
  menuItemText: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '600',
  },
});
