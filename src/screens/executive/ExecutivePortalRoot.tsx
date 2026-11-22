'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Bell,
  CheckCircle2,
  ClipboardCheck,
  FileSpreadsheet,
  Home,
  IndianRupee,
  LayoutGrid,
  Megaphone,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  LinkedInBottomNav,
  LinkedInHeader,
  LinkedInMessagesModal,
  LinkedInSearchModal,
  LinkedInTopTabs,
  MessagePreviewItem,
  SearchableEntry,
} from '@/src/components/linkedin/LinkedInPrimitives';
import { authClient } from '@/lib/auth-api';
import {
  EXECUTIVE_LENS_OPTIONS,
  ExecutiveAnnouncementItem,
  ExecutiveApprovalItem,
  ExecutiveBoardReportItem,
  ExecutiveBottomTab,
  ExecutiveHomeSubTab,
  ExecutiveLens,
  ExecutiveMoreModuleId,
  ExecutivePortalState,
  answerExecutiveCopilotQuery,
  applyExecutiveApprovalDecision,
  createInitialExecutivePortalState,
  getExecutivePortalStorageKey,
  loadExecutivePortalState,
  saveExecutivePortalState,
} from '@/lib/executive-portal-logic';
import { FONT_MONO, FONT_SANS, getPalette } from '../../theme/colors';
import { ExecutiveOverviewTab } from './ExecutiveOverviewTab';
import { ExecutiveWorkforceTab } from './ExecutiveWorkforceTab';
import { ExecutiveFinanceTab } from './ExecutiveFinanceTab';
import { ExecutiveAiInsightsTab } from './ExecutiveAiInsightsTab';
import { ExecutiveApprovalsTab } from './ExecutiveApprovalsTab';
import { ExecutiveMoreTab } from './ExecutiveMoreTab';
import {
  BoardPackPreviewModal,
  BroadcastAnnouncementModal,
  ExecSelfApplyLeaveModal,
  ExecSelfCheckInModal,
  HoldDecisionModal,
} from './ExecutiveModals';
import { execSharedStyles } from './ExecutiveSharedStyles';

interface ExecutivePortalRootProps {
  onLogout?: () => void;
}

const HOME_SUB_TABS: {
  id: ExecutiveHomeSubTab;
  label: string;
}[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'workforce', label: 'Workforce' },
  { id: 'finance', label: 'Finance' },
  { id: 'ai_insights', label: 'Insights' },
];

const BOTTOM_TABS: {
  id: ExecutiveBottomTab;
  label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'workforce', label: 'People', Icon: Users },
  { id: 'finance', label: 'Finance', Icon: IndianRupee },
  { id: 'approvals', label: 'Approvals', Icon: ClipboardCheck },
  { id: 'more', label: 'More', Icon: LayoutGrid },
];

function readSessionExecutiveIdentity(): {
  executiveId: string;
  fullName: string;
  email: string;
} {
  const cached = authClient.getCachedUser();
  if (cached && cached.role === 'executive') {
    return {
      executiveId:
        !cached.id || cached.id === 'usr-demo-001'
          ? 'EXC-101'
          : cached.id.toUpperCase(),
      fullName: cached.full_name || 'Siddharth Malhotra',
      email: cached.email || 'executive@ofc360.com',
    };
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem('ofc360_local_auth_user_v1');
      if (raw) {
        const parsed = JSON.parse(raw) as {
          id?: string;
          role?: string;
          full_name?: string;
          email?: string;
        } | null;
        if (parsed && parsed.role === 'executive') {
          return {
            executiveId:
              !parsed.id || parsed.id === 'usr-demo-001'
                ? 'EXC-101'
                : parsed.id.toUpperCase(),
            fullName: parsed.full_name || 'Siddharth Malhotra',
            email: parsed.email || 'executive@ofc360.com',
          };
        }
      }
    } catch {
      // Fallback to default CEO persona
    }
  }
  return {
    executiveId: 'EXC-101',
    fullName: 'Siddharth Malhotra',
    email: 'executive@ofc360.com',
  };
}

const SSR_DEFAULT_EXECUTIVE = {
  executiveId: 'EXC-101',
  fullName: 'Siddharth Malhotra',
  email: 'executive@ofc360.com',
};

const SSR_FALLBACK_STATE = createInitialExecutivePortalState(SSR_DEFAULT_EXECUTIVE);

const storeListeners = new Set<() => void>();
let snapshotCacheKey = '';
let snapshotCacheValue: ExecutivePortalState = SSR_FALLBACK_STATE;

function subscribeExecutiveStore(listener: () => void): () => void {
  storeListeners.add(listener);
  const handleStorage = (ev: StorageEvent) => {
    if (
      !ev.key ||
      ev.key.startsWith('ofc360_executive_portal_state_v1_') ||
      ev.key === 'ofc360_local_auth_user_v1'
    ) {
      snapshotCacheKey = '';
      listener();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }
  return () => {
    storeListeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

function getClientExecutiveSnapshot(): ExecutivePortalState {
  const sessionId = readSessionExecutiveIdentity();
  const storageKey = getExecutivePortalStorageKey(sessionId.executiveId);
  const raw =
    typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem(storageKey) || ''
      : '';
  const compositeKey = `${sessionId.executiveId}::${sessionId.fullName}::${raw}`;
  if (snapshotCacheKey === compositeKey) {
    return snapshotCacheValue;
  }
  const loaded = loadExecutivePortalState(sessionId);
  snapshotCacheKey = compositeKey;
  snapshotCacheValue = loaded;
  return loaded;
}

function getServerExecutiveSnapshot(): ExecutivePortalState {
  return SSR_FALLBACK_STATE;
}

function mutateExecutiveStore(
  updater: (prev: ExecutivePortalState) => ExecutivePortalState
): void {
  const current = getClientExecutiveSnapshot();
  const next = updater(current);
  saveExecutivePortalState(next);
  const storageKey = getExecutivePortalStorageKey(next.profile.executiveId);
  const raw =
    typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem(storageKey) || ''
      : '';
  snapshotCacheKey = `${next.profile.executiveId}::${next.profile.fullName}::${raw}`;
  snapshotCacheValue = next;
  storeListeners.forEach((l) => l());
}

export function ExecutivePortalRoot({ onLogout }: ExecutivePortalRootProps) {
  const router = useRouter();
  const portalState = useSyncExternalStore(
    subscribeExecutiveStore,
    getClientExecutiveSnapshot,
    getServerExecutiveSnapshot
  );

  const [isDark, setIsDark] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<ExecutiveBottomTab>('home');
  const [activeHomeTab, setActiveHomeTab] = useState<ExecutiveHomeSubTab>('overview');
  const [activeMoreModule, setActiveMoreModule] =
    useState<ExecutiveMoreModuleId | null>(null);

  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [holdTargetItem, setHoldTargetItem] = useState<ExecutiveApprovalItem | null>(null);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState<ExecutiveBoardReportItem | null>(null);
  const [isSelfCheckInOpen, setIsSelfCheckInOpen] = useState(false);
  const [isSelfLeaveOpen, setIsSelfLeaveOpen] = useState(false);
  const [toastText, setToastText] = useState<string | null>(null);

  const palette = getPalette(isDark);

  const showToast = useCallback((msg: string) => {
    setToastText(msg);
  }, []);

  useEffect(() => {
    if (!toastText) return;
    const t = setTimeout(() => setToastText(null), 3200);
    return () => clearTimeout(t);
  }, [toastText]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'OFC360 – Executive Command Center';
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, [isDark]);

  const unreadNotificationsCount = useMemo(
    () => portalState.notifications.filter((n) => !n.read).length,
    [portalState.notifications]
  );

  const currentLensMeta = useMemo(
    () =>
      EXECUTIVE_LENS_OPTIONS.find((l) => l.id === portalState.activeLens) ||
      EXECUTIVE_LENS_OPTIONS[0],
    [portalState.activeLens]
  );

  const handleSelectBottomTab = (tab: ExecutiveBottomTab) => {
    setActiveBottomTab(tab);
    if (tab !== 'more') {
      setActiveMoreModule(null);
    }
  };

  const handleOpenMoreModule = (mod: ExecutiveMoreModuleId) => {
    setActiveBottomTab('more');
    setActiveMoreModule(mod);
  };

  const handleSelectLens = (lens: ExecutiveLens) => {
    mutateExecutiveStore((prev) => ({
      ...prev,
      activeLens: lens,
    }));
    const meta = EXECUTIVE_LENS_OPTIONS.find((l) => l.id === lens);
    showToast(`Switched executive lens to ${meta?.label || 'CEO'}`);
  };

  const handleCycleLensFromHeader = () => {
    const idx = EXECUTIVE_LENS_OPTIONS.findIndex((l) => l.id === portalState.activeLens);
    const next = EXECUTIVE_LENS_OPTIONS[(idx + 1) % EXECUTIVE_LENS_OPTIONS.length];
    handleSelectLens(next.id);
  };

  const handleApproveItem = (approvalId: string) => {
    const res = applyExecutiveApprovalDecision(
      getClientExecutiveSnapshot(),
      approvalId,
      'Approved'
    );
    if (!res.valid) {
      showToast(res.error || 'Unable to sign off item.');
      return;
    }
    mutateExecutiveStore(() => res.nextState);
    const target = res.nextState.approvals.find((a) => a.id === approvalId);
    showToast(`Signed off ${target?.referenceCode || 'approval'}`);
  };

  const handleConfirmHold = (approvalId: string, note: string) => {
    const res = applyExecutiveApprovalDecision(
      getClientExecutiveSnapshot(),
      approvalId,
      'On Hold',
      note
    );
    if (!res.valid) {
      return { valid: false, error: res.error };
    }
    mutateExecutiveStore(() => res.nextState);
    showToast('Item placed on executive hold');
    return { valid: true };
  };

  const handleSubmitCopilotQuery = (query: string) => {
    const clean = query.trim();
    if (clean.length < 3) {
      return {
        valid: false,
        error: 'Enter at least 3 characters to query the AI Executive Copilot.',
      };
    }
    mutateExecutiveStore((prev) => ({
      ...prev,
      copilotHistory: [answerExecutiveCopilotQuery(prev, clean), ...prev.copilotHistory],
    }));
    return { valid: true };
  };

  const handlePublishAnnouncement = (payload: {
    title: string;
    body: string;
    audience: ExecutiveAnnouncementItem['audience'];
    priority: ExecutiveAnnouncementItem['priority'];
  }) => {
    if (payload.title.trim().length < 4 || payload.body.trim().length < 8) {
      return {
        valid: false,
        error: 'Enter a headline (min 4 chars) and announcement message (min 8 chars).',
      };
    }
    mutateExecutiveStore((prev) => ({
      ...prev,
      announcements: [
        {
          id: `ANN-EX-${Date.now().toString().slice(-4)}`,
          title: payload.title.trim(),
          body: payload.body.trim(),
          audience: payload.audience,
          priority: payload.priority,
          publishedBy: `${prev.profile.fullName} · ${currentLensMeta.shortLabel}`,
          publishedAt: 'Just now',
        },
        ...prev.announcements,
      ],
    }));
    showToast('Company announcement broadcast to OFC360');
    return { valid: true };
  };

  const handleSelfPunch = (nextStatus: 'Checked In' | 'Not Checked In') => {
    const nowTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    mutateExecutiveStore((prev) => ({
      ...prev,
      selfService: {
        ...prev.selfService,
        todayStatus: nextStatus,
        punchInTime: nextStatus === 'Checked In' ? nowTime : prev.selfService.punchInTime,
      },
    }));
    showToast(`Executive attendance: ${nextStatus}`);
  };

  const handleSelfApplyLeave = (payload: {
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    if (!payload.startDate.trim() || !payload.endDate.trim() || payload.reason.trim().length < 4) {
      return { valid: false, error: 'Enter valid dates and a brief reason (min 4 chars).' };
    }
    mutateExecutiveStore((prev) => ({
      ...prev,
      selfService: {
        ...prev.selfService,
        leaveRequests: [
          {
            id: `EX-LV-${Date.now().toString().slice(-4)}`,
            leaveType: payload.leaveType,
            startDate: payload.startDate,
            endDate: payload.endDate,
            days: 2,
            status: 'Approved',
            reason: payload.reason.trim(),
          },
          ...prev.selfService.leaveRequests,
        ],
      },
    }));
    showToast(`Personal leave logged (${payload.leaveType})`);
    return { valid: true };
  };

  const handleSaveProfile = (patch: { phone: string; location: string }) => {
    mutateExecutiveStore((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        phone: patch.phone.trim() || prev.profile.phone,
        location: patch.location.trim() || prev.profile.location,
      },
    }));
    showToast('Executive profile saved');
  };

  const handleMarkNotificationsRead = () => {
    mutateExecutiveStore((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    authClient.clearSession();
    void authClient.logout();
    router.push('/login');
  };

  const showHomeSegmentedTabs = activeBottomTab === 'home';

  const searchEntries = useMemo<SearchableEntry[]>(
    () => [
      {
        id: 'exec-act-broadcast',
        title: 'Broadcast Company Announcement',
        subtitle: 'Send executive briefing across OFC360',
        group: 'Action',
        onSelect: () => setIsBroadcastOpen(true),
      },
      {
        id: 'exec-act-approvals',
        title: 'Review High-Value Approvals',
        subtitle: `${portalState.approvals.length} items in executive queue`,
        group: 'Queue',
        onSelect: () => handleSelectBottomTab('approvals'),
      },
      ...portalState.boardReports.slice(0, 5).map((r) => ({
        id: `exec-rep-${r.id}`,
        title: r.title,
        subtitle: `${r.subtitle} · ${r.formatLabel}`,
        group: 'Report',
        onSelect: () => setPreviewReport(r),
      })),
    ],
    [portalState.approvals.length, portalState.boardReports]
  );

  const messageItems = useMemo<MessagePreviewItem[]>(
    () =>
      portalState.announcements.map((a) => ({
        id: a.id,
        title: a.title,
        body: a.body,
        meta: `${a.audience} · ${a.publishedAt}`,
      })),
    [portalState.announcements]
  );

  return (
    <div
      data-testid="ofc360-executive-portal"
      className="min-h-dvh w-full bg-[#F3F2EF] text-[#171717] flex flex-col"
    >
      <LinkedInHeader<ExecutiveBottomTab>
        userName={portalState.profile.fullName}
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={messageItems.length}
        navItems={BOTTOM_TABS}
        activeNavId={activeBottomTab}
        onSelectNav={handleSelectBottomTab}
        onOpenProfile={() => handleOpenMoreModule('profile')}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenMessages={() => setIsMessagesOpen(true)}
      />

      {toastText ? (
        <div className="fixed top-[66px] left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-[440px]">
          <div
            role="status"
            className="flex items-center gap-2.5 rounded-lg bg-[#171717] px-4 py-2.5 text-white border border-[#262626]"
          >
            <CheckCircle2 className="h-4 w-4 text-[#15803D] shrink-0" strokeWidth={2.2} />
            <span className="text-[13px] font-medium truncate">{toastText}</span>
          </div>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-[1040px] flex-1 md:px-4 md:py-4 pb-[74px] lg:pb-8">
        {showHomeSegmentedTabs ? (
          <div className="flex flex-col gap-2 md:gap-3">
            <div className="w-full md:rounded-lg md:overflow-hidden md:border md:border-[#E5E7EB]">
              <LinkedInTopTabs
                tabs={HOME_SUB_TABS}
                activeTab={activeHomeTab}
                onSelect={setActiveHomeTab}
                ariaLabel="Executive command sections"
              />
            </div>

            {/* Clean Executive Lens Strip */}
            <div className="bg-white border-y md:border border-[#E5E7EB] md:rounded-lg px-4 py-2.5 flex items-center gap-2 overflow-x-auto">
              <span className="text-[12px] font-medium text-[#666666] shrink-0 mr-1">
                Lens:
              </span>
              {EXECUTIVE_LENS_OPTIONS.map((opt) => {
                const active = portalState.activeLens === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-label={`Executive Lens ${opt.label}`}
                    onClick={() => handleSelectLens(opt.id)}
                    className={`h-8 shrink-0 rounded-md border px-3 text-[12px] font-medium transition-colors cursor-pointer ${
                      active
                        ? 'border-[#0A66C2] bg-[#EFF6FF] text-[#0A66C2] font-semibold'
                        : 'border-[#E5E7EB] bg-white text-[#666666] hover:bg-[#F3F2EF]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div className="px-4 md:px-0">
              {activeHomeTab === 'overview' ? (
                <ExecutiveOverviewTab
                  state={portalState}
                  isDark={isDark}
                  onSelectHomeTab={setActiveHomeTab}
                  onNavigateBottom={handleSelectBottomTab}
                  onOpenMoreModule={handleOpenMoreModule}
                  onOpenBroadcastModal={() => setIsBroadcastOpen(true)}
                  onApproveItem={handleApproveItem}
                  onHoldItem={(item) => setHoldTargetItem(item)}
                />
              ) : null}

              {activeHomeTab === 'workforce' ? (
                <ExecutiveWorkforceTab state={portalState} isDark={isDark} />
              ) : null}

              {activeHomeTab === 'finance' ? (
                <ExecutiveFinanceTab
                  state={portalState}
                  isDark={isDark}
                  onNavigateBottom={handleSelectBottomTab}
                />
              ) : null}

              {activeHomeTab === 'ai_insights' ? (
                <ExecutiveAiInsightsTab
                  state={portalState}
                  isDark={isDark}
                  onSubmitCopilotQuery={handleSubmitCopilotQuery}
                />
              ) : null}
            </div>
          </div>
        ) : null}

        {activeBottomTab === 'workforce' ? (
          <div className="px-4 py-3 md:p-0">
            <ExecutiveWorkforceTab state={portalState} isDark={isDark} />
          </div>
        ) : null}

        {activeBottomTab === 'finance' ? (
          <div className="px-4 py-3 md:p-0">
            <ExecutiveFinanceTab
              state={portalState}
              isDark={isDark}
              onNavigateBottom={handleSelectBottomTab}
            />
          </div>
        ) : null}

        {activeBottomTab === 'approvals' ? (
          <div className="px-4 py-3 md:p-0">
            <ExecutiveApprovalsTab
              state={portalState}
              isDark={isDark}
              onApproveItem={handleApproveItem}
              onHoldItem={(item) => setHoldTargetItem(item)}
            />
          </div>
        ) : null}

        {activeBottomTab === 'more' ? (
          <div className="px-4 py-3 md:p-0">
            <ExecutiveMoreTab
              state={portalState}
              activeModule={activeMoreModule}
              isDark={isDark}
              onSelectModule={setActiveMoreModule}
              onToggleDarkMode={setIsDark}
              onOpenReportPreview={(rep) => setPreviewReport(rep)}
              onOpenBroadcastModal={() => setIsBroadcastOpen(true)}
              onOpenSelfCheckIn={() => setIsSelfCheckInOpen(true)}
              onOpenSelfLeaveModal={() => setIsSelfLeaveOpen(true)}
              onNavigatePersonalPortal={() => router.push('/dashboard/employee')}
              onSaveProfile={handleSaveProfile}
              onLogout={handleLogout}
            />
          </div>
        ) : null}
      </main>

      <LinkedInBottomNav<ExecutiveBottomTab>
        items={BOTTOM_TABS}
        activeId={activeBottomTab}
        onSelect={handleSelectBottomTab}
      />

      <LinkedInSearchModal
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        entries={searchEntries}
      />

      <LinkedInMessagesModal
        open={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
        items={messageItems}
        canCompose
        onCompose={() => setIsBroadcastOpen(true)}
      />

        {/* Quick Actions (+) Bottom Sheet Modal */}
        <Modal
          visible={isQuickCreateOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsQuickCreateOpen(false)}
        >
          <Pressable
            onPress={() => setIsQuickCreateOpen(false)}
            style={[execSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}
          >
            <View
              style={[
                execSharedStyles.modalSheet,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <View style={execSharedStyles.dragHandleWrap}>
                <View style={[execSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
              </View>
              <Text style={[execSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                Executive Quick Actions
              </Text>
              <Text style={[execSharedStyles.metaText, { color: palette.textMuted, marginBottom: 14 }]}>
                Broadcast announcements, export Board packs, or sign off escalations
              </Text>

              <View style={styles.quickSheetList}>
                <Pressable
                  accessibilityLabel="Quick Menu Broadcast Company Announcement"
                  onPress={() => {
                    setIsQuickCreateOpen(false);
                    setIsBroadcastOpen(true);
                  }}
                  style={[
                    styles.quickSheetItem,
                    { backgroundColor: palette.inputBg, borderColor: palette.border },
                  ]}
                >
                  <Megaphone size={18} color={palette.amber} strokeWidth={2.2} />
                  <Text style={[execSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    Broadcast Company Announcement
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityLabel="Quick Menu Export Board Pack"
                  onPress={() => {
                    setIsQuickCreateOpen(false);
                    setPreviewReport(portalState.boardReports[0]);
                  }}
                  style={[
                    styles.quickSheetItem,
                    { backgroundColor: palette.inputBg, borderColor: palette.border },
                  ]}
                >
                  <FileSpreadsheet size={18} color={palette.primary} strokeWidth={2.2} />
                  <Text style={[execSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    Export Board Pack
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityLabel="Quick Menu Approve High-Value Escalations"
                  onPress={() => {
                    setIsQuickCreateOpen(false);
                    handleSelectBottomTab('approvals');
                  }}
                  style={[
                    styles.quickSheetItem,
                    { backgroundColor: palette.inputBg, borderColor: palette.border },
                  ]}
                >
                  <ClipboardCheck size={18} color={palette.emerald} strokeWidth={2.2} />
                  <Text style={[execSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    Approve High-Value Escalations
                  </Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Modal>

        {/* Notifications Bottom Sheet Modal */}
        <Modal
          visible={isNotificationsOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsNotificationsOpen(false)}
        >
          <Pressable
            onPress={() => setIsNotificationsOpen(false)}
            style={[execSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}
          >
            <View
              style={[
                execSharedStyles.modalSheet,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <View style={execSharedStyles.dragHandleWrap}>
                <View style={[execSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
              </View>
              <View style={execSharedStyles.modalHeaderRow}>
                <Text style={[execSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                  Executive Briefings ({portalState.notifications.length})
                </Text>
                {unreadNotificationsCount > 0 ? (
                  <Pressable
                    accessibilityLabel="Mark all executive notifications read"
                    onPress={handleMarkNotificationsRead}
                  >
                    <Text style={[execSharedStyles.linkText, { color: palette.primary }]}>
                      Mark all read
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {portalState.notifications.map((n) => (
                  <View
                    key={n.id}
                    style={[
                      styles.quickSheetItem,
                      {
                        backgroundColor: n.read ? palette.inputBg : palette.primaryLight,
                        borderColor: palette.border,
                        marginBottom: 8,
                      },
                    ]}
                  >
                    <Bell size={16} color={n.read ? palette.textMuted : palette.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={[execSharedStyles.subTitle, { color: palette.textPrimary }]}>
                        {n.title}
                      </Text>
                      <Text style={[execSharedStyles.metaText, { color: palette.textSecondary }]}>
                        {n.message}
                      </Text>
                      <Text
                        style={[
                          execSharedStyles.metaText,
                          { color: palette.textMuted, fontSize: 10, marginTop: 2 },
                        ]}
                      >
                        {n.category} · {n.timestamp}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>

        {/* Executive Action Modals */}
        <HoldDecisionModal
          visible={Boolean(holdTargetItem)}
          item={holdTargetItem}
          isDark={isDark}
          onClose={() => setHoldTargetItem(null)}
          onConfirmHold={handleConfirmHold}
        />

        <BroadcastAnnouncementModal
          visible={isBroadcastOpen}
          isDark={isDark}
          onClose={() => setIsBroadcastOpen(false)}
          onPublish={handlePublishAnnouncement}
        />

        <BoardPackPreviewModal
          visible={Boolean(previewReport)}
          report={previewReport}
          state={portalState}
          isDark={isDark}
          onClose={() => setPreviewReport(null)}
          onDownloadComplete={(filename) => showToast(`Downloaded ${filename}`)}
        />

        <ExecSelfCheckInModal
          visible={isSelfCheckInOpen}
          isDark={isDark}
          profile={portalState.profile}
          selfService={portalState.selfService}
          onClose={() => setIsSelfCheckInOpen(false)}
          onSubmitPunch={handleSelfPunch}
        />

        <ExecSelfApplyLeaveModal
          visible={isSelfLeaveOpen}
          isDark={isDark}
          balances={portalState.selfService.leaveBalances}
          onClose={() => setIsSelfLeaveOpen(false)}
          onSubmitLeave={handleSelfApplyLeave}
        />
    </div>
  );
}

const styles = StyleSheet.create({
  safeRoot: {
    flex: 1,
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneShell: {
    flex: 1,
    height: '100%',
    width: '100%',
    maxWidth: 440,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    overflow: 'hidden',
  },
  headerBar: {
    height: 56,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandTitle: {
    fontFamily: FONT_SANS,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lensHeaderBtn: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lensHeaderText: {
    fontSize: 11,
    fontWeight: '700',
  },
  plainIconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  notifDot: {
    position: 'absolute',
    top: -1,
    right: -2,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  toastText: {
    fontFamily: FONT_SANS,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  screenScroll: {
    flex: 1,
    minHeight: 0,
  },
  screenScrollContent: {
    padding: 16,
    paddingBottom: 28,
  },
  homeContainer: {
    gap: 12,
  },
  lensStrip: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  lensChip: {
    minHeight: 36,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lensChipText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '700',
  },
  tabSegmentBar: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 3,
    gap: 2,
  },
  segmentButton: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  segmentButtonText: {
    fontFamily: FONT_SANS,
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: -0.25,
    textAlign: 'center',
  },
  bottomTabBar: {
    height: 64,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrap: {
    width: 34,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: FONT_SANS,
    fontSize: 10,
    marginTop: 2,
    letterSpacing: -0.1,
  },
  quickSheetList: {
    gap: 10,
  },
  quickSheetItem: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
});
