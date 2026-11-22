import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Laptop,
  LifeBuoy,
  Lock,
  Plus,
  Send,
  UserCheck,
  X,
} from 'lucide-react';
import { FONT_SANS, getPalette } from '../../theme/colors';
import {
  IT_CANNED_KB_REPLIES,
  ItHelpdeskTicket,
  ItTicketPriority,
  ItTicketStatus,
} from '@/lib/it-admin-portal-logic';
import { getItAdminStatusTone, itSharedStyles } from './ItAdminSharedStyles';

interface ItAdminTicketsTabProps {
  tickets: ItHelpdeskTicket[];
  itAdminId: string;
  itAdminName: string;
  isDark: boolean;
  onOpenCreateTicket: () => void;
  onUpdateTicket: (
    ticketId: string,
    payload: {
      replyText?: string;
      isInternalNote?: boolean;
      nextStatus?: ItTicketStatus;
      assignToMe?: boolean;
    }
  ) => { valid: boolean; error?: string };
}

const STATUS_FILTERS: ('All' | ItTicketStatus)[] = [
  'All',
  'Open',
  'In Progress',
  'Waiting on User',
  'Resolved',
];

const PRIORITY_FILTERS: ('All' | ItTicketPriority)[] = [
  'All',
  'Critical',
  'High',
  'Medium',
  'Low',
];

export function ItAdminTicketsTab({
  tickets,
  itAdminId,
  isDark,
  onOpenCreateTicket,
  onUpdateTicket,
}: ItAdminTicketsTabProps) {
  const palette = getPalette(isDark);
  const [statusFilter, setStatusFilter] = useState<'All' | ItTicketStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | ItTicketPriority>('All');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const filteredTickets = useMemo(
    () =>
      tickets.filter((t) => {
        if (statusFilter !== 'All' && t.status !== statusFilter) return false;
        if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
        return true;
      }),
    [tickets, statusFilter, priorityFilter]
  );

  const selectedTicket = useMemo(
    () =>
      selectedTicketId
        ? tickets.find((t) => t.id === selectedTicketId) || null
        : null,
    [tickets, selectedTicketId]
  );

  const handleSendReply = (nextStatus?: ItTicketStatus) => {
    if (!selectedTicket) return;
    setReplyError(null);
    const res = onUpdateTicket(selectedTicket.id, {
      replyText: replyText.trim() || undefined,
      isInternalNote,
      nextStatus,
    });
    if (!res.valid) {
      setReplyError(res.error || 'Enter a message before sending.');
      return;
    }
    setReplyText('');
  };

  return (
    <View style={itSharedStyles.stack}>
      <View
        style={[
          itSharedStyles.cardCompact,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={itSharedStyles.cardHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={[itSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
              IT Helpdesk &amp; SLA Queue ({tickets.length})
            </Text>
            <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
              Triage hardware, VPN, SSO &amp; biometric tickets
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Create IT Ticket"
            onPress={onOpenCreateTicket}
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
              New Ticket
            </Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {STATUS_FILTERS.map((st) => {
            const active = statusFilter === st;
            return (
              <Pressable
                key={st}
                accessibilityLabel={`Ticket Status ${st}`}
                onPress={() => setStatusFilter(st)}
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
                  {st}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.filterScroll, { marginTop: 8 }]}
        >
          {PRIORITY_FILTERS.map((pr) => {
            const active = priorityFilter === pr;
            return (
              <Pressable
                key={pr}
                accessibilityLabel={`Ticket Priority ${pr}`}
                onPress={() => setPriorityFilter(pr)}
                style={[
                  itSharedStyles.filterChip,
                  {
                    backgroundColor: active ? palette.secondaryCta : palette.inputBg,
                    borderColor: active ? palette.secondaryCta : palette.border,
                  },
                ]}
              >
                <Text
                  style={[
                    itSharedStyles.filterChipText,
                    { color: active ? '#FFFFFF' : palette.textSecondary },
                  ]}
                >
                  {pr}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {filteredTickets.length === 0 ? (
        <View
          style={[
            itSharedStyles.card,
            { backgroundColor: palette.surface, borderColor: palette.border, alignItems: 'center' },
          ]}
        >
          <LifeBuoy size={24} color={palette.textMuted} />
          <Text style={[itSharedStyles.subTitle, { color: palette.textPrimary, marginTop: 8 }]}>
            No tickets match selected filters
          </Text>
        </View>
      ) : (
        filteredTickets.map((ticket) => {
          const sTone = getItAdminStatusTone(ticket.status, palette);
          const pTone = getItAdminStatusTone(ticket.priority, palette);
          return (
            <Pressable
              key={ticket.id}
              accessibilityLabel={`Open Ticket ${ticket.ticketNumber}`}
              onPress={() => {
                setSelectedTicketId(ticket.id);
                setReplyError(null);
                setReplyText('');
              }}
              style={[
                itSharedStyles.cardCompact,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <View style={styles.rowBetween}>
                <Text
                  style={[
                    itSharedStyles.metaText,
                    itSharedStyles.monoText,
                    { color: palette.primary, fontWeight: '700' },
                  ]}
                >
                  {ticket.ticketNumber} · {ticket.category}
                </Text>
                <View style={styles.badgePair}>
                  <View style={[itSharedStyles.statusBadge, { backgroundColor: pTone.bg }]}>
                    <Text style={[itSharedStyles.statusBadgeText, { color: pTone.text }]}>
                      {ticket.priority}
                    </Text>
                  </View>
                  <View style={[itSharedStyles.statusBadge, { backgroundColor: sTone.bg }]}>
                    <Text style={[itSharedStyles.statusBadgeText, { color: sTone.text }]}>
                      {ticket.status}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.ticketTitle, { color: palette.textPrimary }]}>
                {ticket.subject}
              </Text>
              <Text style={[itSharedStyles.metaText, { color: palette.textSecondary, marginTop: 3 }]}>
                {ticket.employeeName} · {ticket.department}
                {ticket.relatedAssetTag ? ` · ${ticket.relatedAssetTag}` : ''}
              </Text>

              <View style={[styles.rowBetween, { marginTop: 10 }]}>
                <View style={styles.slaRow}>
                  <Clock size={13} color={ticket.status === 'Resolved' ? palette.emerald : palette.amber} />
                  <Text
                    style={[
                      itSharedStyles.metaText,
                      itSharedStyles.monoText,
                      {
                        color:
                          ticket.status === 'Resolved' ? palette.emerald : palette.textSecondary,
                      },
                    ]}
                  >
                    SLA: {ticket.slaTargetLabel}
                  </Text>
                </View>
                <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
                  {ticket.assignedToName ? `Owner: ${ticket.assignedToName}` : 'Unassigned'}
                </Text>
              </View>
            </Pressable>
          );
        })
      )}

      {/* Ticket Detail & SLA Resolution Drawer Modal */}
      <Modal
        visible={Boolean(selectedTicket)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTicketId(null)}
      >
        <View style={[itSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
          <View
            style={[
              itSharedStyles.modalSheet,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={itSharedStyles.dragHandleWrap}>
              <View style={[itSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
            </View>

            {selectedTicket ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={itSharedStyles.modalHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        itSharedStyles.metaText,
                        itSharedStyles.monoText,
                        { color: palette.primary, fontWeight: '700' },
                      ]}
                    >
                      {selectedTicket.ticketNumber} · {selectedTicket.slaTargetLabel}
                    </Text>
                    <Text style={[itSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                      {selectedTicket.subject}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityLabel="Close Ticket Detail"
                    onPress={() => setSelectedTicketId(null)}
                  >
                    <X size={20} color={palette.textMuted} />
                  </Pressable>
                </View>

                <View
                  style={[
                    styles.contextCard,
                    { backgroundColor: palette.inputBg, borderColor: palette.border },
                  ]}
                >
                  <Text style={[itSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    {selectedTicket.employeeName} ({selectedTicket.employeeId})
                  </Text>
                  <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
                    {selectedTicket.employeeEmail} · {selectedTicket.department}
                  </Text>
                  {selectedTicket.relatedAssetTag ? (
                    <View style={styles.assetTagRow}>
                      <Laptop size={13} color={palette.primary} />
                      <Text
                        style={[
                          itSharedStyles.metaText,
                          itSharedStyles.monoText,
                          { color: palette.primary },
                        ]}
                      >
                        Linked Asset: {selectedTicket.relatedAssetTag}
                      </Text>
                    </View>
                  ) : null}
                  <Text style={[itSharedStyles.metaText, { color: palette.textSecondary, marginTop: 6 }]}>
                    {selectedTicket.description}
                  </Text>
                </View>

                {/* Quick Status & Ownership Controls */}
                <View style={styles.quickActionBar}>
                  {selectedTicket.assignedToId !== itAdminId ? (
                    <Pressable
                      accessibilityLabel="Assign Ticket to Me"
                      onPress={() =>
                        onUpdateTicket(selectedTicket.id, {
                          assignToMe: true,
                          nextStatus:
                            selectedTicket.status === 'Open'
                              ? 'In Progress'
                              : selectedTicket.status,
                        })
                      }
                      style={[
                        itSharedStyles.secondaryBtn,
                        { flex: 1, backgroundColor: palette.primaryLight, borderColor: palette.primary },
                      ]}
                    >
                      <UserCheck size={14} color={palette.primary} />
                      <Text style={[itSharedStyles.secondaryBtnText, { color: palette.primary }]}>
                        Assign to Me
                      </Text>
                    </Pressable>
                  ) : null}

                  {selectedTicket.status !== 'Resolved' ? (
                    <Pressable
                      accessibilityLabel="Resolve Selected Ticket"
                      onPress={() =>
                        onUpdateTicket(selectedTicket.id, {
                          nextStatus: 'Resolved',
                          replyText:
                            replyText.trim() ||
                            'Issue resolved and verified by IT Operations.',
                          isInternalNote: false,
                        })
                      }
                      style={[
                        itSharedStyles.primaryBtn,
                        { flex: 1, backgroundColor: palette.emerald },
                      ]}
                    >
                      <CheckCircle2 size={15} color="#FFFFFF" />
                      <Text style={itSharedStyles.primaryBtnText}>Mark Resolved</Text>
                    </Pressable>
                  ) : null}
                </View>

                {/* Thread History */}
                <Text
                  style={[
                    itSharedStyles.fieldLabel,
                    { color: palette.textSecondary, marginTop: 14 },
                  ]}
                >
                  Activity &amp; Messages ({selectedTicket.messages.length})
                </Text>
                <View style={styles.threadStack}>
                  {selectedTicket.messages.length === 0 ? (
                    <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
                      No replies logged yet. Use a canned KB fix or write a response below.
                    </Text>
                  ) : (
                    selectedTicket.messages.map((m) => (
                      <View
                        key={m.id}
                        style={[
                          styles.msgBox,
                          {
                            backgroundColor: m.isInternalNote
                              ? palette.amberBg
                              : palette.inputBg,
                            borderColor: m.isInternalNote ? palette.amber : palette.border,
                          },
                        ]}
                      >
                        <View style={styles.rowBetween}>
                          <Text style={[itSharedStyles.subTitle, { color: palette.textPrimary }]}>
                            {m.senderName}
                          </Text>
                          <Text style={[itSharedStyles.metaText, { color: palette.textMuted }]}>
                            {m.isInternalNote ? 'Internal IT Note · ' : ''}
                            {m.timestamp}
                          </Text>
                        </View>
                        <Text
                          style={[
                            itSharedStyles.metaText,
                            { color: palette.textSecondary, marginTop: 4 },
                          ]}
                        >
                          {m.text}
                        </Text>
                      </View>
                    ))
                  )}
                </View>

                {/* Knowledge Base Canned Fixes */}
                <View style={{ marginTop: 14 }}>
                  <View style={styles.kbHeader}>
                    <BookOpen size={14} color={palette.primary} />
                    <Text style={[itSharedStyles.fieldLabel, { color: palette.textSecondary, marginBottom: 0 }]}>
                      Quick KB Canned Replies
                    </Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[styles.filterScroll, { marginTop: 6 }]}
                  >
                    {IT_CANNED_KB_REPLIES.map((kb) => (
                      <Pressable
                        key={kb.id}
                        accessibilityLabel={`Insert KB Reply ${kb.title}`}
                        onPress={() => {
                          setIsInternalNote(false);
                          setReplyText(kb.body);
                          setReplyError(null);
                        }}
                        style={[
                          itSharedStyles.filterChip,
                          { backgroundColor: palette.primaryLight, borderColor: palette.primary },
                        ]}
                      >
                        <Text style={[itSharedStyles.filterChipText, { color: palette.primary }]}>
                          {kb.title}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                {/* Reply Mode Toggle */}
                <View style={[styles.modeRow, { marginTop: 12 }]}>
                  <Pressable
                    accessibilityLabel="Public Reply Mode"
                    onPress={() => setIsInternalNote(false)}
                    style={[
                      itSharedStyles.filterChip,
                      {
                        flex: 1,
                        backgroundColor: !isInternalNote ? palette.primaryLight : palette.inputBg,
                        borderColor: !isInternalNote ? palette.primary : palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        itSharedStyles.filterChipText,
                        { color: !isInternalNote ? palette.primary : palette.textSecondary },
                      ]}
                    >
                      Public Reply
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel="Internal IT Note Mode"
                    onPress={() => setIsInternalNote(true)}
                    style={[
                      itSharedStyles.filterChip,
                      {
                        flex: 1,
                        flexDirection: 'row',
                        gap: 4,
                        backgroundColor: isInternalNote ? palette.amberBg : palette.inputBg,
                        borderColor: isInternalNote ? palette.amber : palette.border,
                      },
                    ]}
                  >
                    <Lock size={12} color={isInternalNote ? palette.amber : palette.textMuted} />
                    <Text
                      style={[
                        itSharedStyles.filterChipText,
                        { color: isInternalNote ? palette.amber : palette.textSecondary },
                      ]}
                    >
                      Internal IT Note
                    </Text>
                  </Pressable>
                </View>

                {replyError ? (
                  <View
                    style={[
                      itSharedStyles.errorBanner,
                      { backgroundColor: palette.roseBg, borderColor: palette.rose, marginTop: 10 },
                    ]}
                  >
                    <Text style={[itSharedStyles.errorBannerText, { color: palette.rose }]}>
                      {replyError}
                    </Text>
                  </View>
                ) : null}

                <TextInput
                  accessibilityLabel="Ticket Reply Input"
                  value={replyText}
                  onChangeText={(t) => {
                    setReplyText(t);
                    setReplyError(null);
                  }}
                  multiline
                  placeholder={
                    isInternalNote
                      ? 'Add internal diagnostic note (hidden from employee)...'
                      : 'Write reply to employee...'
                  }
                  placeholderTextColor={palette.textMuted}
                  style={[
                    itSharedStyles.textArea,
                    {
                      marginTop: 10,
                      backgroundColor: palette.inputBg,
                      borderColor: palette.border,
                      color: palette.textPrimary,
                    },
                  ]}
                />

                <View style={styles.sendRow}>
                  <Pressable
                    accessibilityLabel="Send Ticket Reply"
                    onPress={() => handleSendReply('In Progress')}
                    style={[itSharedStyles.primaryBtn, { flex: 1, backgroundColor: palette.primary }]}
                  >
                    <Send size={14} color="#FFFFFF" />
                    <Text style={itSharedStyles.primaryBtnText}>
                      {isInternalNote ? 'Save Internal Note' : 'Send Public Reply'}
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  filterScroll: {
    gap: 8,
    paddingRight: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  badgePair: {
    flexDirection: 'row',
    gap: 6,
  },
  ticketTitle: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  slaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  contextCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  assetTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  quickActionBar: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  threadStack: {
    gap: 8,
  },
  msgBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  kbHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sendRow: {
    marginTop: 10,
  },
});
