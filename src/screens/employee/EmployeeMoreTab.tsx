import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  DoorOpen,
  IndianRupee,
  Laptop,
  LifeBuoy,
  LogOut,
  Megaphone,
  MessageSquare,
  Moon,
  Plane,
  Plus,
  Receipt,
  Send,
  Star,
  Sun,
  User,
  X,
} from 'lucide-react';
import { FONT_MONO, FONT_SANS, getPalette } from '../../theme/colors';
import { AnnouncementItem } from '@/lib/hr-dashboard-logic';
import {
  EmployeeAssignedAsset,
  EmployeeChatThread,
  EmployeeExitReasonCategory,
  EmployeeHelpdeskTicket,
  EmployeeMoreModuleId,
  EmployeePortalState,
  EmployeeProfileData,
  computeExitClearanceProgress,
  computeSuggestedLastWorkingDay,
  validateResignationSubmission,
} from '@/lib/employee-portal-logic';
import { empSharedStyles, getStatusTone } from './EmployeeSharedStyles';

interface EmployeeMoreTabProps {
  state: EmployeePortalState;
  announcements: AnnouncementItem[];
  activeModule: EmployeeMoreModuleId | null;
  isDark: boolean;
  onSelectModule: (mod: EmployeeMoreModuleId | null) => void;
  onToggleDarkMode: (next: boolean) => void;
  onReportAssetIssue: (assetId: string, issueNote: string) => void;
  onOpenClaimExpense: () => void;
  onSubmitTravel: (payload: {
    destination: string;
    purpose: string;
    departureDate: string;
    returnDate: string;
    mode: 'Flight' | 'Train' | 'Cab & Hotel';
    estimatedBudget: number;
  }) => void;
  onOpenRaiseTicket: () => void;
  onReplyTicket: (ticketId: string, message: string) => void;
  onSendChatMessage: (threadId: string, text: string) => void;
  onToggleOnboardingTask: (taskId: string) => void;
  onSubmitResignation: (payload: {
    reasonCategory: EmployeeExitReasonCategory;
    requestedLastWorkingDay: string;
    handoverTo: string;
    notes: string;
  }) => void;
  onWithdrawResignation: (withdrawalReason: string) => void;
  onToggleClearanceTask: (taskId: string) => void;
  onSubmitExitInterview: (rating: number, feedback: string) => void;
  onSaveProfile: (patch: Partial<EmployeeProfileData>) => void;
  onLogout: () => void;
}

export function EmployeeMoreTab({
  state,
  announcements,
  activeModule,
  isDark,
  onSelectModule,
  onToggleDarkMode,
  onReportAssetIssue,
  onOpenClaimExpense,
  onSubmitTravel,
  onOpenRaiseTicket,
  onReplyTicket,
  onSendChatMessage,
  onToggleOnboardingTask,
  onSubmitResignation,
  onWithdrawResignation,
  onToggleClearanceTask,
  onSubmitExitInterview,
  onSaveProfile,
  onLogout,
}: EmployeeMoreTabProps) {
  const palette = getPalette(isDark);

  // Asset issue modal
  const [issueAsset, setIssueAsset] = useState<EmployeeAssignedAsset | null>(null);
  const [issueNote, setIssueNote] = useState('');

  // Travel modal
  const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);
  const [destination, setDestination] = useState('');
  const [purpose, setPurpose] = useState('');
  const [depDate, setDepDate] = useState('2026-12-03');
  const [retDate, setRetDate] = useState('2026-12-05');
  const [travelMode, setTravelMode] = useState<'Flight' | 'Train' | 'Cab & Hotel'>('Flight');
  const [budget, setBudget] = useState('14000');

  // Helpdesk thread modal
  const [selectedTicket, setSelectedTicket] = useState<EmployeeHelpdeskTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Chat thread
  const [selectedChat, setSelectedChat] = useState<EmployeeChatThread | null>(null);
  const [chatMessageText, setChatMessageText] = useState('');

  // Exit Management modals & form state
  const todayIso = new Date().toISOString().slice(0, 10);
  const defaultSuggestedLwd = computeSuggestedLastWorkingDay(
    todayIso,
    state.exitManagement.noticePeriodDays
  );
  const [isResignModalOpen, setIsResignModalOpen] = useState(false);
  const [exitReasonCategory, setExitReasonCategory] =
    useState<EmployeeExitReasonCategory>('Career Growth');
  const [requestedLwd, setRequestedLwd] = useState(defaultSuggestedLwd);
  const [handoverTo, setHandoverTo] = useState(
    state.exitManagement.handoverTo || 'Vikram Nair (Staff Engineer)'
  );
  const [resignNotes, setResignNotes] = useState('');
  const [resignError, setResignError] = useState<string | null>(null);

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const [interviewRating, setInterviewRating] = useState<number>(
    state.exitManagement.exitInterviewRating || 4
  );
  const [interviewFeedback, setInterviewFeedback] = useState(
    state.exitManagement.exitInterviewFeedback || ''
  );
  const [interviewError, setInterviewError] = useState<string | null>(null);

  // Profile edit state
  const [editPhone, setEditPhone] = useState(state.profile.phone);
  const [editAddress, setEditAddress] = useState(state.profile.address);
  const [editEmgName, setEditEmgName] = useState(state.profile.emergencyContactName);
  const [editEmgPhone, setEditEmgPhone] = useState(state.profile.emergencyContactPhone);
  const [editBankName, setEditBankName] = useState(state.profile.bankName);

  const clearanceProgress = computeExitClearanceProgress(
    state.exitManagement.clearanceTasks
  );
  const isResignationActive =
    state.exitManagement.status === 'Resignation Submitted' ||
    state.exitManagement.status === 'Notice Period Active' ||
    state.exitManagement.status === 'Clearance In Progress';

  const hubItems: {
    id: EmployeeMoreModuleId;
    title: string;
    subtitle: string;
    badge: string;
    color: string;
    Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  }[] = [
    {
      id: 'assets',
      title: 'My Assets',
      subtitle: 'Laptop, badge & hardware',
      badge: `${state.assignedAssets.length} Assigned`,
      color: palette.primary,
      Icon: Laptop,
    },
    {
      id: 'expenses',
      title: 'Expenses',
      subtitle: 'Submit claims & payouts',
      badge: `${state.expenseClaims.length} Claims`,
      color: palette.emerald,
      Icon: Receipt,
    },
    {
      id: 'travel',
      title: 'Business Travel',
      subtitle: 'Trips, flights & hotels',
      badge: `${state.travelRequests.length} Trips`,
      color: palette.sky,
      Icon: Plane,
    },
    {
      id: 'helpdesk',
      title: 'Helpdesk',
      subtitle: 'HR & IT support tickets',
      badge: `${state.helpdeskTickets.length} Tickets`,
      color: palette.amber,
      Icon: LifeBuoy,
    },
    {
      id: 'announcements',
      title: 'Announcements',
      subtitle: 'Company-wide broadcasts',
      badge: `${announcements.length} Notices`,
      color: palette.violet,
      Icon: Megaphone,
    },
    {
      id: 'connect',
      title: 'OFC Connect',
      subtitle: 'Direct chat & HR desk',
      badge: `${state.chatThreads.length} Active`,
      color: palette.rose,
      Icon: MessageSquare,
    },
    {
      id: 'onboarding',
      title: 'Onboarding',
      subtitle: 'Self-service checklist',
      badge: `${state.onboardingTasks.filter((t) => t.completed).length}/${state.onboardingTasks.length}`,
      color: palette.emerald,
      Icon: ClipboardList,
    },
    {
      id: 'exit_management',
      title: 'Exit Management',
      subtitle: 'Resignation, notice & FnF',
      badge: isResignationActive
        ? `${clearanceProgress.completed}/${clearanceProgress.total} Clear`
        : state.exitManagement.status === 'Withdrawn'
          ? 'Withdrawn'
          : `${state.exitManagement.noticePeriodDays}d Notice`,
      color: isResignationActive ? palette.amber : palette.rose,
      Icon: DoorOpen,
    },
    {
      id: 'profile',
      title: 'My Profile',
      subtitle: 'Contact, bank & theme',
      badge: state.profile.employeeId,
      color: palette.primary,
      Icon: User,
    },
  ];

  if (!activeModule) {
    return (
      <View style={empSharedStyles.stack}>
        <View
          style={[
            empSharedStyles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={styles.profilePreviewRow}>
            <View style={[styles.avatarCircle, { backgroundColor: palette.primary }]}>
              <Text style={styles.avatarText}>{state.profile.avatarInitials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
                {state.profile.fullName}
              </Text>
              <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                {state.profile.designation} · {state.profile.employeeId}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Open My Profile"
              onPress={() => onSelectModule('profile')}
              style={[
                empSharedStyles.filterChip,
                { backgroundColor: palette.primaryLight, borderColor: palette.primary },
              ]}
            >
              <Text style={[empSharedStyles.filterChipText, { color: palette.primary }]}>
                Edit
              </Text>
            </Pressable>
          </View>
        </View>

        <View
          style={[
            empSharedStyles.card,
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
                empSharedStyles.listRow,
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
                  <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
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

        <Pressable
          accessibilityLabel="Logout from Employee Portal"
          onPress={onLogout}
          style={[
            empSharedStyles.secondaryBtn,
            {
              backgroundColor: palette.roseBg,
              borderColor: palette.rose,
            },
          ]}
        >
          <LogOut size={16} color={palette.rose} strokeWidth={2.2} />
          <Text style={[empSharedStyles.secondaryBtnText, { color: palette.rose }]}>
            Logout
          </Text>
        </Pressable>
      </View>
    );
  }

  const liveTicket = selectedTicket
    ? state.helpdeskTickets.find((t) => t.id === selectedTicket.id) || selectedTicket
    : null;
  const liveChat = selectedChat
    ? state.chatThreads.find((c) => c.id === selectedChat.id) || selectedChat
    : null;

  return (
    <View style={empSharedStyles.stack}>
      {/* Back to Hub Bar */}
      <Pressable
        accessibilityLabel="Back to Self-Service Hub"
        onPress={() => onSelectModule(null)}
        style={[
          styles.backBar,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <ArrowLeft size={16} color={palette.primary} />
        <Text style={[empSharedStyles.linkText, { color: palette.primary }]}>
          Back to Employee Hub
        </Text>
      </Pressable>

      {/* 1. MY ASSETS */}
      {activeModule === 'assets' ? (
        <View
          style={[
            empSharedStyles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary, marginBottom: 8 }]}>
            Assigned Company Assets ({state.assignedAssets.length})
          </Text>
          {state.assignedAssets.map((ast, idx) => {
            const tone = getStatusTone(ast.condition, palette);
            return (
              <View
                key={ast.id}
                style={[
                  empSharedStyles.listRow,
                  idx > 0 ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle } : null,
                ]}
              >
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                      {ast.name}
                    </Text>
                    <Text style={[empSharedStyles.metaText, empSharedStyles.monoText, { color: palette.textMuted }]}>
                      Tag {ast.assetTag} · S/N {ast.serialNumber}
                    </Text>
                    {ast.issueNote ? (
                      <Text style={[empSharedStyles.metaText, { color: palette.rose, marginTop: 3 }]}>
                        Issue: {ast.issueNote}
                      </Text>
                    ) : null}
                  </View>
                  <View style={[empSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                    <Text style={[empSharedStyles.statusBadgeText, { color: tone.text }]}>
                      {ast.condition}
                    </Text>
                  </View>
                </View>
                <Pressable
                  accessibilityLabel={`Report Issue for ${ast.name}`}
                  onPress={() => {
                    setIssueAsset(ast);
                    setIssueNote('');
                  }}
                  style={{ marginTop: 8, alignSelf: 'flex-start' }}
                >
                  <Text style={[empSharedStyles.linkText, { color: palette.rose }]}>
                    Report Hardware Issue
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* 2. EXPENSES */}
      {activeModule === 'expenses' ? (
        <View
          style={[
            empSharedStyles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={empSharedStyles.cardHeaderRow}>
            <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
              Expenses &amp; Reimbursements
            </Text>
            <Pressable
              accessibilityLabel="New Expense Claim"
              onPress={onOpenClaimExpense}
              style={[empSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
            >
              <Plus size={15} color="#FFFFFF" />
              <Text style={empSharedStyles.primaryBtnText}>Claim</Text>
            </Pressable>
          </View>

          {state.expenseClaims.map((ex, idx) => {
            const tone = getStatusTone(ex.status, palette);
            return (
              <View
                key={ex.id}
                style={[
                  empSharedStyles.listRow,
                  idx > 0 ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle } : null,
                ]}
              >
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                      {ex.title}
                    </Text>
                    <Text style={[empSharedStyles.metaText, empSharedStyles.monoText, { color: palette.textMuted }]}>
                      ₹{ex.amount.toLocaleString('en-IN')} · {ex.category} · {ex.expenseDate}
                    </Text>
                  </View>
                  <View style={[empSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                    <Text style={[empSharedStyles.statusBadgeText, { color: tone.text }]}>
                      {ex.status}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* 3. TRAVEL */}
      {activeModule === 'travel' ? (
        <View
          style={[
            empSharedStyles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={empSharedStyles.cardHeaderRow}>
            <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
              Business Travel Requests
            </Text>
            <Pressable
              accessibilityLabel="New Travel Request"
              onPress={() => setIsTravelModalOpen(true)}
              style={[empSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
            >
              <Plus size={15} color="#FFFFFF" />
              <Text style={empSharedStyles.primaryBtnText}>Request Trip</Text>
            </Pressable>
          </View>

          {state.travelRequests.map((trv, idx) => {
            const tone = getStatusTone(trv.status, palette);
            return (
              <View
                key={trv.id}
                style={[
                  empSharedStyles.listRow,
                  idx > 0 ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle } : null,
                ]}
              >
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                      {trv.destination}
                    </Text>
                    <Text style={[empSharedStyles.metaText, { color: palette.textSecondary }]}>
                      {trv.purpose}
                    </Text>
                    <Text style={[empSharedStyles.metaText, empSharedStyles.monoText, { color: palette.textMuted }]}>
                      {trv.departureDate} → {trv.returnDate} · {trv.mode} · ₹{trv.estimatedBudget.toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={[empSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                    <Text style={[empSharedStyles.statusBadgeText, { color: tone.text }]}>
                      {trv.status}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* 4. HELPDESK */}
      {activeModule === 'helpdesk' ? (
        <View
          style={[
            empSharedStyles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <View style={empSharedStyles.cardHeaderRow}>
            <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
              Helpdesk &amp; Support Tickets
            </Text>
            <Pressable
              accessibilityLabel="Raise New Support Ticket"
              onPress={onOpenRaiseTicket}
              style={[empSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
            >
              <Plus size={15} color="#FFFFFF" />
              <Text style={empSharedStyles.primaryBtnText}>Raise Ticket</Text>
            </Pressable>
          </View>

          {state.helpdeskTickets.map((tkt, idx) => {
            const tone = getStatusTone(tkt.status, palette);
            return (
              <View
                key={tkt.id}
                style={[
                  empSharedStyles.listRow,
                  idx > 0 ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle } : null,
                ]}
              >
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                      {tkt.subject}
                    </Text>
                    <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                      {tkt.ticketNumber} · {tkt.category} · {tkt.priority} Priority
                    </Text>
                  </View>
                  <View style={[empSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                    <Text style={[empSharedStyles.statusBadgeText, { color: tone.text }]}>
                      {tkt.status}
                    </Text>
                  </View>
                </View>
                <Pressable
                  accessibilityLabel={`Open Ticket Thread ${tkt.ticketNumber}`}
                  onPress={() => setSelectedTicket(tkt)}
                  style={{ marginTop: 8, alignSelf: 'flex-start' }}
                >
                  <Text style={[empSharedStyles.linkText, { color: palette.primary }]}>
                    Open Thread &amp; Reply ({tkt.replies.length}) →
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* 5. ANNOUNCEMENTS */}
      {activeModule === 'announcements' ? (
        <View
          style={[
            empSharedStyles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary, marginBottom: 8 }]}>
            Company Announcements ({announcements.length})
          </Text>
          {announcements.map((ann, idx) => (
            <View
              key={ann.id}
              style={[
                empSharedStyles.listRow,
                idx > 0 ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle } : null,
              ]}
            >
              <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                {ann.title}
              </Text>
              <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                {ann.category} · {ann.department} · {ann.publishedDate}
              </Text>
              <Text style={[empSharedStyles.metaText, { color: palette.textSecondary, marginTop: 4 }]}>
                {ann.description}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* 6. OFC CONNECT CHAT */}
      {activeModule === 'connect' ? (
        <View
          style={[
            empSharedStyles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary, marginBottom: 8 }]}>
            OFC Connect Team Channels
          </Text>
          {state.chatThreads.map((thread, idx) => (
            <Pressable
              key={thread.id}
              accessibilityLabel={`Chat with ${thread.contactName}`}
              onPress={() => setSelectedChat(thread)}
              style={[
                empSharedStyles.listRow,
                idx > 0 ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle } : null,
              ]}
            >
              <View style={styles.rowBetween}>
                <View style={[styles.chatAvatar, { backgroundColor: palette.primaryLight }]}>
                  <Text style={[styles.chatAvatarText, { color: palette.primary }]}>
                    {thread.initials}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    {thread.contactName}
                  </Text>
                  <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                    {thread.roleTitle} · {thread.statusText}
                  </Text>
                </View>
                <ChevronRight size={16} color={palette.textMuted} />
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* 7. ONBOARDING CHECKLIST */}
      {activeModule === 'onboarding' ? (
        <View
          style={[
            empSharedStyles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary, marginBottom: 8 }]}>
            Self-Onboarding Checklist
          </Text>
          {state.onboardingTasks.map((task, idx) => (
            <Pressable
              key={task.id}
              accessibilityLabel={`Toggle Task ${task.title}`}
              onPress={() => onToggleOnboardingTask(task.id)}
              style={[
                empSharedStyles.listRow,
                idx > 0 ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle } : null,
              ]}
            >
              <View style={styles.rowBetween}>
                <CheckCircle2
                  size={20}
                  color={task.completed ? palette.emerald : palette.textMuted}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      empSharedStyles.subTitle,
                      {
                        color: task.completed ? palette.textMuted : palette.textPrimary,
                        textDecorationLine: task.completed ? 'line-through' : 'none',
                      },
                    ]}
                  >
                    {task.title}
                  </Text>
                  <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                    {task.category} · Due {task.dueDate}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* 8. EXIT MANAGEMENT */}
      {activeModule === 'exit_management' ? (
        <View style={empSharedStyles.stack}>
          {/* Separation & Notice Period Card */}
          <View
            style={[
              empSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={empSharedStyles.cardHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
                  Separation &amp; Notice Status
                </Text>
                <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                  {state.profile.fullName} · {state.profile.employeeId}
                </Text>
              </View>
              <View
                style={[
                  empSharedStyles.statusBadge,
                  {
                    backgroundColor: getStatusTone(state.exitManagement.status, palette).bg,
                  },
                ]}
              >
                <Text
                  style={[
                    empSharedStyles.statusBadgeText,
                    {
                      color: getStatusTone(state.exitManagement.status, palette).text,
                    },
                  ]}
                >
                  {state.exitManagement.status}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.exitMetaGrid,
                { backgroundColor: palette.inputBg, borderColor: palette.borderSubtle },
              ]}
            >
              <View style={styles.rowBetween}>
                <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                  Notice Period Policy
                </Text>
                <Text
                  style={[
                    empSharedStyles.subTitle,
                    empSharedStyles.monoText,
                    { color: palette.textPrimary },
                  ]}
                >
                  {state.exitManagement.noticePeriodDays} Days
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                  Reporting Manager
                </Text>
                <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                  {state.profile.reportingManager}
                </Text>
              </View>
              {isResignationActive ? (
                <>
                  <View style={styles.rowBetween}>
                    <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                      Submitted On
                    </Text>
                    <Text
                      style={[
                        empSharedStyles.subTitle,
                        empSharedStyles.monoText,
                        { color: palette.textPrimary },
                      ]}
                    >
                      {state.exitManagement.submittedDate}
                    </Text>
                  </View>
                  <View style={styles.rowBetween}>
                    <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                      Requested Last Working Day
                    </Text>
                    <Text
                      style={[
                        empSharedStyles.subTitle,
                        empSharedStyles.monoText,
                        { color: palette.primary },
                      ]}
                    >
                      {state.exitManagement.requestedLastWorkingDay}
                    </Text>
                  </View>
                  <View style={styles.rowBetween}>
                    <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                      Reason &amp; KT Owner
                    </Text>
                    <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                      {state.exitManagement.reasonCategory} → {state.exitManagement.handoverTo}
                    </Text>
                  </View>
                </>
              ) : null}
              {state.exitManagement.status === 'Withdrawn' &&
              state.exitManagement.withdrawalReason ? (
                <View style={styles.rowBetween}>
                  <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                    Withdrawal Note
                  </Text>
                  <Text
                    style={[
                      empSharedStyles.metaText,
                      { color: palette.textSecondary, flex: 1, textAlign: 'right' },
                    ]}
                  >
                    {state.exitManagement.withdrawalReason}
                  </Text>
                </View>
              ) : null}
            </View>

            {isResignationActive ? (
              <Pressable
                accessibilityLabel="Open Withdraw Resignation"
                onPress={() => {
                  setWithdrawReason('');
                  setWithdrawError(null);
                  setIsWithdrawModalOpen(true);
                }}
                style={[
                  empSharedStyles.secondaryBtn,
                  {
                    backgroundColor: palette.roseBg,
                    borderColor: palette.rose,
                    marginTop: 12,
                  },
                ]}
              >
                <Text style={[empSharedStyles.secondaryBtnText, { color: palette.rose }]}>
                  Withdraw Resignation Request
                </Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityLabel="Initiate Resignation"
                onPress={() => {
                  setRequestedLwd(defaultSuggestedLwd);
                  setResignError(null);
                  setIsResignModalOpen(true);
                }}
                style={[
                  empSharedStyles.primaryBtn,
                  { backgroundColor: palette.rose, marginTop: 12 },
                ]}
              >
                <DoorOpen size={16} color="#FFFFFF" />
                <Text style={empSharedStyles.primaryBtnText}>Initiate Resignation</Text>
              </Pressable>
            )}
          </View>

          {/* Clearance & Handover Checklist Card */}
          <View
            style={[
              empSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={empSharedStyles.cardHeaderRow}>
              <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
                Exit Clearance Checklist
              </Text>
              <Text
                style={[
                  empSharedStyles.metaText,
                  empSharedStyles.monoText,
                  { color: palette.primary, fontWeight: '700' },
                ]}
              >
                {clearanceProgress.completed}/{clearanceProgress.total} ({clearanceProgress.pct}%)
              </Text>
            </View>

            <View style={[styles.progressTrack, { backgroundColor: palette.surfaceMuted }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${clearanceProgress.pct}%`,
                    backgroundColor:
                      clearanceProgress.pct === 100 ? palette.emerald : palette.primary,
                  },
                ]}
              />
            </View>

            {state.exitManagement.clearanceTasks.map((task, idx) => {
              const tone = getStatusTone(task.status, palette);
              return (
                <View
                  key={task.id}
                  style={[
                    empSharedStyles.listRow,
                    idx > 0
                      ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                      : null,
                  ]}
                >
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                        {task.title}
                      </Text>
                      <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                        {task.department} · Owner: {task.owner}
                      </Text>
                    </View>
                    <View style={[empSharedStyles.statusBadge, { backgroundColor: tone.bg }]}>
                      <Text style={[empSharedStyles.statusBadgeText, { color: tone.text }]}>
                        {task.status}
                      </Text>
                    </View>
                  </View>
                  {task.employeeActionable ? (
                    <Pressable
                      accessibilityLabel={`Toggle Clearance ${task.id}`}
                      onPress={() => onToggleClearanceTask(task.id)}
                      style={{ marginTop: 8, alignSelf: 'flex-start' }}
                    >
                      <Text
                        style={[
                          empSharedStyles.linkText,
                          {
                            color:
                              task.status === 'Completed'
                                ? palette.emerald
                                : palette.primary,
                          },
                        ]}
                      >
                        {task.status === 'Completed'
                          ? '✓ Handover Step Completed (Undo)'
                          : 'Mark Handover Step Complete →'}
                      </Text>
                    </Pressable>
                  ) : (
                    <Text
                      style={[
                        empSharedStyles.metaText,
                        { color: palette.textMuted, marginTop: 6 },
                      ]}
                    >
                      HR Admin verification step
                    </Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* Full & Final Settlement Preview Card */}
          <View
            style={[
              empSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={empSharedStyles.cardHeaderRow}>
              <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
                Full &amp; Final (FnF) Preview
              </Text>
              <IndianRupee size={16} color={palette.emerald} />
            </View>

            <View style={styles.fnfList}>
              <View style={styles.rowBetween}>
                <Text style={[empSharedStyles.metaText, { color: palette.textSecondary }]}>
                  Earned Leave Encashment ({state.exitManagement.fnfEstimate.leaveEncashmentDays}d EL)
                </Text>
                <Text
                  style={[
                    empSharedStyles.subTitle,
                    empSharedStyles.monoText,
                    { color: palette.textPrimary },
                  ]}
                >
                  ₹{state.exitManagement.fnfEstimate.leaveEncashmentAmount.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={[empSharedStyles.metaText, { color: palette.textSecondary }]}>
                  Pending Approved Reimbursements
                </Text>
                <Text
                  style={[
                    empSharedStyles.subTitle,
                    empSharedStyles.monoText,
                    { color: palette.textPrimary },
                  ]}
                >
                  ₹{state.exitManagement.fnfEstimate.pendingReimbursements.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={[empSharedStyles.metaText, { color: palette.textSecondary }]}>
                  Est. Pro-Rata Month Salary
                </Text>
                <Text
                  style={[
                    empSharedStyles.subTitle,
                    empSharedStyles.monoText,
                    { color: palette.textPrimary },
                  ]}
                >
                  ₹{state.exitManagement.fnfEstimate.proRataSalaryEstimate.toLocaleString('en-IN')}
                </Text>
              </View>

              <View
                style={[
                  styles.fnfTotalRow,
                  { borderTopColor: palette.border },
                ]}
              >
                <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                  Estimated Net Settlement
                </Text>
                <Text
                  style={[
                    empSharedStyles.sectionTitle,
                    empSharedStyles.monoText,
                    { color: palette.emerald },
                  ]}
                >
                  ₹{state.exitManagement.fnfEstimate.estimatedNetSettlement.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            <Text style={[empSharedStyles.metaText, { color: palette.textMuted, marginTop: 8 }]}>
              Timeline: {state.exitManagement.fnfEstimate.settlementTimeline}
            </Text>
          </View>

          {/* Confidential Exit Interview Card */}
          <View
            style={[
              empSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={empSharedStyles.cardHeaderRow}>
              <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary }]}>
                Confidential Exit Interview
              </Text>
              <View
                style={[
                  empSharedStyles.statusBadge,
                  {
                    backgroundColor: state.exitManagement.exitInterviewSubmitted
                      ? palette.emeraldBg
                      : palette.primaryLight,
                  },
                ]}
              >
                <Text
                  style={[
                    empSharedStyles.statusBadgeText,
                    {
                      color: state.exitManagement.exitInterviewSubmitted
                        ? palette.emerald
                        : palette.primary,
                    },
                  ]}
                >
                  {state.exitManagement.exitInterviewSubmitted ? 'Submitted' : 'Feedback'}
                </Text>
              </View>
            </View>

            {interviewError ? (
              <View
                style={[
                  empSharedStyles.errorBanner,
                  { backgroundColor: palette.roseBg, borderColor: palette.rose },
                ]}
              >
                <Text style={[empSharedStyles.errorBannerText, { color: palette.rose }]}>
                  {interviewError}
                </Text>
              </View>
            ) : null}

            <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Overall OFC360 Experience Rating (1–5)
            </Text>
            <View style={[empSharedStyles.chipRow, { marginBottom: 10 }]}>
              {[1, 2, 3, 4, 5].map((starVal) => {
                const active = interviewRating === starVal;
                return (
                  <Pressable
                    key={starVal}
                    accessibilityLabel={`Exit Rating ${starVal}`}
                    onPress={() => setInterviewRating(starVal)}
                    style={[
                      empSharedStyles.filterChip,
                      {
                        flexDirection: 'row',
                        gap: 4,
                        backgroundColor: active ? palette.primaryLight : palette.inputBg,
                        borderColor: active ? palette.primary : palette.border,
                      },
                    ]}
                  >
                    <Star
                      size={13}
                      color={active ? palette.primary : palette.textMuted}
                      fill={active ? palette.primary : 'transparent'}
                    />
                    <Text
                      style={[
                        empSharedStyles.filterChipText,
                        empSharedStyles.monoText,
                        { color: active ? palette.primary : palette.textSecondary },
                      ]}
                    >
                      {starVal}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Team, Role &amp; Culture Feedback
            </Text>
            <TextInput
              accessibilityLabel="Exit Interview Feedback"
              value={interviewFeedback}
              onChangeText={(txt) => {
                setInterviewFeedback(txt);
                setInterviewError(null);
              }}
              multiline
              placeholder="Share honest reflections on onboarding, leadership, or growth..."
              placeholderTextColor={palette.textMuted}
              style={[
                empSharedStyles.textArea,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                },
              ]}
            />

            <Pressable
              accessibilityLabel="Submit Exit Interview"
              onPress={() => {
                if (interviewFeedback.trim().length < 8) {
                  setInterviewError('Please enter at least 8 characters of feedback.');
                  return;
                }
                setInterviewError(null);
                onSubmitExitInterview(interviewRating, interviewFeedback.trim());
              }}
              style={[
                empSharedStyles.primaryBtn,
                { backgroundColor: palette.primary, marginTop: 12 },
              ]}
            >
              <Text style={empSharedStyles.primaryBtnText}>
                {state.exitManagement.exitInterviewSubmitted
                  ? 'Update Exit Interview'
                  : 'Submit Exit Interview'}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* 9. MY PROFILE */}
      {activeModule === 'profile' ? (
        <View style={empSharedStyles.stack}>
          <View
            style={[
              empSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[empSharedStyles.sectionTitle, { color: palette.textPrimary, marginBottom: 10 }]}>
              Personal Contact &amp; Bank Details
            </Text>

            <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Mobile Number
            </Text>
            <TextInput
              accessibilityLabel="Profile Mobile Number"
              value={editPhone}
              onChangeText={setEditPhone}
              style={[
                empSharedStyles.input,
                empSharedStyles.monoText,
                { backgroundColor: palette.inputBg, borderColor: palette.border, color: palette.textPrimary },
              ]}
            />

            <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 10 }]}>
              Residential Address
            </Text>
            <TextInput
              accessibilityLabel="Profile Residential Address"
              value={editAddress}
              onChangeText={setEditAddress}
              style={[
                empSharedStyles.input,
                { backgroundColor: palette.inputBg, borderColor: palette.border, color: palette.textPrimary },
              ]}
            />

            <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 10 }]}>
              Emergency Contact Name
            </Text>
            <TextInput
              accessibilityLabel="Emergency Contact Name"
              value={editEmgName}
              onChangeText={setEditEmgName}
              style={[
                empSharedStyles.input,
                { backgroundColor: palette.inputBg, borderColor: palette.border, color: palette.textPrimary },
              ]}
            />

            <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 10 }]}>
              Emergency Contact Phone
            </Text>
            <TextInput
              accessibilityLabel="Emergency Contact Phone"
              value={editEmgPhone}
              onChangeText={setEditEmgPhone}
              style={[
                empSharedStyles.input,
                empSharedStyles.monoText,
                { backgroundColor: palette.inputBg, borderColor: palette.border, color: palette.textPrimary },
              ]}
            />

            <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 10 }]}>
              Salary Bank Name ({state.profile.bankAccountMasked})
            </Text>
            <TextInput
              accessibilityLabel="Salary Bank Name"
              value={editBankName}
              onChangeText={setEditBankName}
              style={[
                empSharedStyles.input,
                { backgroundColor: palette.inputBg, borderColor: palette.border, color: palette.textPrimary },
              ]}
            />

            <Pressable
              accessibilityLabel="Save Profile Changes"
              onPress={() =>
                onSaveProfile({
                  phone: editPhone.trim(),
                  address: editAddress.trim(),
                  emergencyContactName: editEmgName.trim(),
                  emergencyContactPhone: editEmgPhone.trim(),
                  bankName: editBankName.trim(),
                })
              }
              style={[empSharedStyles.primaryBtn, { backgroundColor: palette.primary, marginTop: 14 }]}
            >
              <Text style={empSharedStyles.primaryBtnText}>Save Profile Changes</Text>
            </Pressable>
          </View>

          <View
            style={[
              empSharedStyles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {isDark ? <Moon size={18} color={palette.primary} /> : <Sun size={18} color={palette.amber} />}
                <View>
                  <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    Appearance Theme
                  </Text>
                  <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                    {isDark ? 'Dark mode enabled' : 'Light mode enabled'}
                  </Text>
                </View>
              </View>
              <Switch
                accessibilityLabel="Toggle Dark Mode"
                value={isDark}
                onValueChange={onToggleDarkMode}
              />
            </View>

            <Pressable
              accessibilityLabel="Sign Out of Employee Portal"
              onPress={onLogout}
              style={[
                empSharedStyles.secondaryBtn,
                {
                  backgroundColor: palette.roseBg,
                  borderColor: palette.rose,
                  marginTop: 14,
                },
              ]}
            >
              <LogOut size={16} color={palette.rose} />
              <Text style={[empSharedStyles.secondaryBtnText, { color: palette.rose }]}>
                Sign Out
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* Asset Issue Modal */}
      <Modal
        visible={Boolean(issueAsset)}
        transparent
        animationType="slide"
        onRequestClose={() => setIssueAsset(null)}
      >
        <View style={[empSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
          <View
            style={[
              empSharedStyles.modalSheet,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={empSharedStyles.dragHandleWrap}>
              <View style={[empSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
            </View>
            <View style={empSharedStyles.modalHeaderRow}>
              <Text style={[empSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                Report Issue: {issueAsset?.assetTag}
              </Text>
              <Pressable onPress={() => setIssueAsset(null)}>
                <X size={20} color={palette.textMuted} />
              </Pressable>
            </View>
            <TextInput
              accessibilityLabel="Asset Issue Description"
              value={issueNote}
              onChangeText={setIssueNote}
              multiline
              placeholder="Describe hardware fault, battery wear, or badge issue..."
              placeholderTextColor={palette.textMuted}
              style={[
                empSharedStyles.textArea,
                { backgroundColor: palette.inputBg, borderColor: palette.border, color: palette.textPrimary },
              ]}
            />
            <Pressable
              onPress={() => {
                if (!issueAsset || issueNote.trim().length < 4) return;
                onReportAssetIssue(issueAsset.id, issueNote.trim());
                setIssueAsset(null);
              }}
              style={[empSharedStyles.primaryBtn, { backgroundColor: palette.rose, marginTop: 14 }]}
            >
              <AlertTriangle size={16} color="#FFFFFF" />
              <Text style={empSharedStyles.primaryBtnText}>Submit Hardware Issue</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Travel Request Modal */}
      <Modal
        visible={isTravelModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsTravelModalOpen(false)}
      >
        <View style={[empSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
          <View
            style={[
              empSharedStyles.modalSheet,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={empSharedStyles.dragHandleWrap}>
              <View style={[empSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
            </View>
            <View style={empSharedStyles.modalHeaderRow}>
              <Text style={[empSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                Request Business Travel
              </Text>
              <Pressable onPress={() => setIsTravelModalOpen(false)}>
                <X size={20} color={palette.textMuted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                Destination City / Hub
              </Text>
              <TextInput
                value={destination}
                onChangeText={setDestination}
                placeholder="e.g. Hyderabad · HITEC City"
                placeholderTextColor={palette.textMuted}
                style={[
                  empSharedStyles.input,
                  { backgroundColor: palette.inputBg, borderColor: palette.border, color: palette.textPrimary },
                ]}
              />

              <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 10 }]}>
                Business Purpose
              </Text>
              <TextInput
                value={purpose}
                onChangeText={setPurpose}
                placeholder="e.g. Enterprise Client Onboarding"
                placeholderTextColor={palette.textMuted}
                style={[
                  empSharedStyles.input,
                  { backgroundColor: palette.inputBg, borderColor: palette.border, color: palette.textPrimary },
                ]}
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                    Departure
                  </Text>
                  <TextInput
                    value={depDate}
                    onChangeText={setDepDate}
                    style={[
                      empSharedStyles.input,
                      empSharedStyles.monoText,
                      { backgroundColor: palette.inputBg, borderColor: palette.border, color: palette.textPrimary },
                    ]}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                    Return
                  </Text>
                  <TextInput
                    value={retDate}
                    onChangeText={setRetDate}
                    style={[
                      empSharedStyles.input,
                      empSharedStyles.monoText,
                      { backgroundColor: palette.inputBg, borderColor: palette.border, color: palette.textPrimary },
                    ]}
                  />
                </View>
              </View>

              <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 10 }]}>
                Travel Mode &amp; Budget (₹)
              </Text>
              <View style={[empSharedStyles.chipRow, { marginBottom: 8 }]}>
                {(['Flight', 'Train', 'Cab & Hotel'] as const).map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => setTravelMode(m)}
                    style={[
                      empSharedStyles.filterChip,
                      {
                        backgroundColor: travelMode === m ? palette.primaryLight : palette.inputBg,
                        borderColor: travelMode === m ? palette.primary : palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        empSharedStyles.filterChipText,
                        { color: travelMode === m ? palette.primary : palette.textSecondary },
                      ]}
                    >
                      {m}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
                style={[
                  empSharedStyles.input,
                  empSharedStyles.monoText,
                  { backgroundColor: palette.inputBg, borderColor: palette.border, color: palette.textPrimary },
                ]}
              />

              <Pressable
                onPress={() => {
                  if (destination.trim().length < 2 || purpose.trim().length < 4) return;
                  onSubmitTravel({
                    destination: destination.trim(),
                    purpose: purpose.trim(),
                    departureDate: depDate,
                    returnDate: retDate,
                    mode: travelMode,
                    estimatedBudget: Number(budget) || 12000,
                  });
                  setDestination('');
                  setPurpose('');
                  setIsTravelModalOpen(false);
                }}
                style={[empSharedStyles.primaryBtn, { backgroundColor: palette.primary, marginTop: 16 }]}
              >
                <Text style={empSharedStyles.primaryBtnText}>Submit Travel Request</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Helpdesk Thread Modal */}
      <Modal
        visible={Boolean(liveTicket)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTicket(null)}
      >
        <View style={[empSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
          <View
            style={[
              empSharedStyles.modalSheet,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={empSharedStyles.dragHandleWrap}>
              <View style={[empSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
            </View>
            {liveTicket ? (
              <>
                <View style={empSharedStyles.modalHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[empSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                      {liveTicket.ticketNumber}
                    </Text>
                    <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                      {liveTicket.subject}
                    </Text>
                  </View>
                  <Pressable onPress={() => setSelectedTicket(null)}>
                    <X size={20} color={palette.textMuted} />
                  </Pressable>
                </View>

                <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
                  {liveTicket.replies.map((rep) => (
                    <View
                      key={rep.id}
                      style={[
                        styles.replyBubble,
                        {
                          backgroundColor:
                            rep.sender === 'Employee' ? palette.primaryLight : palette.inputBg,
                          borderColor: palette.border,
                        },
                      ]}
                    >
                      <Text style={[empSharedStyles.metaText, { color: palette.primary, fontWeight: '700' }]}>
                        {rep.senderName} · {rep.timestamp}
                      </Text>
                      <Text style={[empSharedStyles.metaText, { color: palette.textPrimary, marginTop: 3 }]}>
                        {rep.message}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.replyInputRow}>
                  <TextInput
                    accessibilityLabel="Reply to Helpdesk Ticket"
                    value={ticketReplyText}
                    onChangeText={setTicketReplyText}
                    placeholder="Write a follow-up reply..."
                    placeholderTextColor={palette.textMuted}
                    style={[
                      empSharedStyles.input,
                      { flex: 1, backgroundColor: palette.inputBg, borderColor: palette.border, color: palette.textPrimary },
                    ]}
                  />
                  <Pressable
                    accessibilityLabel="Send Ticket Reply"
                    onPress={() => {
                      if (!ticketReplyText.trim()) return;
                      onReplyTicket(liveTicket.id, ticketReplyText.trim());
                      setTicketReplyText('');
                    }}
                    style={[empSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
                  >
                    <Send size={15} color="#FFFFFF" />
                  </Pressable>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* OFC Connect Chat Thread Modal */}
      <Modal
        visible={Boolean(liveChat)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedChat(null)}
      >
        <View style={[empSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
          <View
            style={[
              empSharedStyles.modalSheet,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={empSharedStyles.dragHandleWrap}>
              <View style={[empSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
            </View>
            {liveChat ? (
              <>
                <View style={empSharedStyles.modalHeaderRow}>
                  <View>
                    <Text style={[empSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                      {liveChat.contactName}
                    </Text>
                    <Text style={[empSharedStyles.metaText, { color: palette.textMuted }]}>
                      {liveChat.roleTitle} · {liveChat.statusText}
                    </Text>
                  </View>
                  <Pressable onPress={() => setSelectedChat(null)}>
                    <X size={20} color={palette.textMuted} />
                  </Pressable>
                </View>

                <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
                  {liveChat.messages.map((m) => (
                    <View
                      key={m.id}
                      style={[
                        styles.replyBubble,
                        {
                          backgroundColor: m.sender === 'me' ? palette.primaryLight : palette.inputBg,
                          borderColor: palette.border,
                        },
                      ]}
                    >
                      <Text style={[empSharedStyles.metaText, { color: palette.textPrimary }]}>
                        {m.text}
                      </Text>
                      <Text style={[empSharedStyles.metaText, { color: palette.textMuted, fontSize: 10, marginTop: 2 }]}>
                        {m.sender === 'me' ? 'You' : liveChat.contactName} · {m.time}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.replyInputRow}>
                  <TextInput
                    accessibilityLabel="Message Input"
                    value={chatMessageText}
                    onChangeText={setChatMessageText}
                    placeholder="Type a message..."
                    placeholderTextColor={palette.textMuted}
                    style={[
                      empSharedStyles.input,
                      { flex: 1, backgroundColor: palette.inputBg, borderColor: palette.border, color: palette.textPrimary },
                    ]}
                  />
                  <Pressable
                    accessibilityLabel="Send Chat Message"
                    onPress={() => {
                      if (!chatMessageText.trim()) return;
                      onSendChatMessage(liveChat.id, chatMessageText.trim());
                      setChatMessageText('');
                    }}
                    style={[empSharedStyles.primaryBtn, { backgroundColor: palette.primary }]}
                  >
                    <Send size={15} color="#FFFFFF" />
                  </Pressable>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Initiate Resignation Modal */}
      <Modal
        visible={isResignModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsResignModalOpen(false)}
      >
        <View style={[empSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
          <View
            style={[
              empSharedStyles.modalSheet,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={empSharedStyles.dragHandleWrap}>
              <View style={[empSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
            </View>
            <View style={empSharedStyles.modalHeaderRow}>
              <Text style={[empSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                Initiate Resignation
              </Text>
              <Pressable
                accessibilityLabel="Close Resignation Modal"
                onPress={() => setIsResignModalOpen(false)}
              >
                <X size={20} color={palette.textMuted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {resignError ? (
                <View
                  style={[
                    empSharedStyles.errorBanner,
                    { backgroundColor: palette.roseBg, borderColor: palette.rose },
                  ]}
                >
                  <Text style={[empSharedStyles.errorBannerText, { color: palette.rose }]}>
                    {resignError}
                  </Text>
                </View>
              ) : null}

              <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
                Primary Reason
              </Text>
              <View style={empSharedStyles.chipRow}>
                {(
                  [
                    'Career Growth',
                    'Higher Studies',
                    'Relocation',
                    'Compensation',
                    'Health & Personal',
                  ] as const
                ).map((cat) => {
                  const active = exitReasonCategory === cat;
                  return (
                    <Pressable
                      key={cat}
                      accessibilityLabel={`Reason ${cat}`}
                      onPress={() => {
                        setExitReasonCategory(cat);
                        setResignError(null);
                      }}
                      style={[
                        empSharedStyles.filterChip,
                        {
                          backgroundColor: active ? palette.primaryLight : palette.inputBg,
                          borderColor: active ? palette.primary : palette.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          empSharedStyles.filterChipText,
                          { color: active ? palette.primary : palette.textSecondary },
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 12 }]}>
                Requested Last Working Day (60-day suggested: {defaultSuggestedLwd})
              </Text>
              <TextInput
                accessibilityLabel="Requested Last Working Day"
                value={requestedLwd}
                onChangeText={(txt) => {
                  setRequestedLwd(txt);
                  setResignError(null);
                }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={palette.textMuted}
                style={[
                  empSharedStyles.input,
                  empSharedStyles.monoText,
                  {
                    backgroundColor: palette.inputBg,
                    borderColor: palette.border,
                    color: palette.textPrimary,
                  },
                ]}
              />

              <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 12 }]}>
                Knowledge Transfer (KT) Handover To
              </Text>
              <TextInput
                accessibilityLabel="KT Handover Owner"
                value={handoverTo}
                onChangeText={(txt) => {
                  setHandoverTo(txt);
                  setResignError(null);
                }}
                placeholder="e.g. Vikram Nair (Staff Engineer)"
                placeholderTextColor={palette.textMuted}
                style={[
                  empSharedStyles.input,
                  {
                    backgroundColor: palette.inputBg,
                    borderColor: palette.border,
                    color: palette.textPrimary,
                  },
                ]}
              />

              <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary, marginTop: 12 }]}>
                Resignation Notes
              </Text>
              <TextInput
                accessibilityLabel="Resignation Notes"
                value={resignNotes}
                onChangeText={(txt) => {
                  setResignNotes(txt);
                  setResignError(null);
                }}
                multiline
                placeholder="Mention notice flexibility or transition plan..."
                placeholderTextColor={palette.textMuted}
                style={[
                  empSharedStyles.textArea,
                  {
                    backgroundColor: palette.inputBg,
                    borderColor: palette.border,
                    color: palette.textPrimary,
                  },
                ]}
              />

              <Pressable
                accessibilityLabel="Submit Resignation"
                onPress={() => {
                  const check = validateResignationSubmission({
                    requestedLastWorkingDay: requestedLwd,
                    reasonCategory: exitReasonCategory,
                    handoverTo,
                    notes: resignNotes,
                  });
                  if (!check.valid) {
                    setResignError(check.error || 'Please review all required fields.');
                    return;
                  }
                  onSubmitResignation({
                    reasonCategory: exitReasonCategory,
                    requestedLastWorkingDay: requestedLwd.trim(),
                    handoverTo: handoverTo.trim(),
                    notes: resignNotes.trim(),
                  });
                  setResignNotes('');
                  setResignError(null);
                  setIsResignModalOpen(false);
                }}
                style={[
                  empSharedStyles.primaryBtn,
                  { backgroundColor: palette.rose, marginTop: 16 },
                ]}
              >
                <Text style={empSharedStyles.primaryBtnText}>Submit Resignation</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Withdraw Resignation Modal */}
      <Modal
        visible={isWithdrawModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsWithdrawModalOpen(false)}
      >
        <View style={[empSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}>
          <View
            style={[
              empSharedStyles.modalSheet,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={empSharedStyles.dragHandleWrap}>
              <View style={[empSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
            </View>
            <View style={empSharedStyles.modalHeaderRow}>
              <Text style={[empSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                Withdraw Resignation
              </Text>
              <Pressable
                accessibilityLabel="Close Withdraw Resignation Modal"
                onPress={() => setIsWithdrawModalOpen(false)}
              >
                <X size={20} color={palette.textMuted} />
              </Pressable>
            </View>

            {withdrawError ? (
              <View
                style={[
                  empSharedStyles.errorBanner,
                  { backgroundColor: palette.roseBg, borderColor: palette.rose },
                ]}
              >
                <Text style={[empSharedStyles.errorBannerText, { color: palette.rose }]}>
                  {withdrawError}
                </Text>
              </View>
            ) : null}

            <Text style={[empSharedStyles.fieldLabel, { color: palette.textSecondary }]}>
              Reason for Withdrawal
            </Text>
            <TextInput
              accessibilityLabel="Withdrawal Reason"
              value={withdrawReason}
              onChangeText={(txt) => {
                setWithdrawReason(txt);
                setWithdrawError(null);
              }}
              multiline
              placeholder="Briefly state why you are withdrawing your resignation..."
              placeholderTextColor={palette.textMuted}
              style={[
                empSharedStyles.textArea,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                },
              ]}
            />

            <Pressable
              accessibilityLabel="Confirm Withdraw Resignation"
              onPress={() => {
                if (withdrawReason.trim().length < 6) {
                  setWithdrawError('Please enter a brief withdrawal reason (min 6 characters).');
                  return;
                }
                onWithdrawResignation(withdrawReason.trim());
                setWithdrawReason('');
                setWithdrawError(null);
                setIsWithdrawModalOpen(false);
              }}
              style={[
                empSharedStyles.primaryBtn,
                { backgroundColor: palette.primary, marginTop: 14 },
              ]}
            >
              <Text style={empSharedStyles.primaryBtnText}>Confirm Withdrawal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatarText: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    fontWeight: '700',
  },
  replyBubble: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  replyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  exitMetaGrid: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  fnfList: {
    gap: 10,
  },
  fnfTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 1,
  },
});
