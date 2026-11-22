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
  Award,
  Bell,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Home,
  LayoutGrid,
  Megaphone,
  ScanFace,
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
  ManagerBottomTab,
  ManagerHomeSubTab,
  ManagerMoreModuleId,
  ManagerPortalState,
  ManagerShiftType,
  ROSTER_DAYS_OF_WEEK,
  RosterDayKey,
  SHIFT_TIMINGS_MAP,
  TeamAttendanceStatus,
  applyManagerApprovalDecision,
  assignTeamRosterShift,
  createInitialManagerPortalState,
  loadManagerPortalState,
  regularizeMemberAttendance,
  saveManagerPortalState,
  scopeTeamByManager,
} from '@/lib/manager-portal-logic';
import {
  getEmployeePortalStorageKey,
  loadEmployeePortalState,
  saveEmployeePortalState,
} from '@/lib/employee-portal-logic';
import { FONT_SANS, getPalette } from '../../theme/colors';
import { ManagerOverviewTab } from './ManagerOverviewTab';
import { ManagerApprovalsTab } from './ManagerApprovalsTab';
import {
  ManagerMyTeamTab,
  ManagerTeamRosterView,
  ManagerTeamShiftsView,
} from './ManagerTeamAndRosterViews';
import { ManagerPerformanceTab } from './ManagerPerformanceTab';
import { ManagerMoreTab } from './ManagerMoreTab';
import {
  AssignRosterModal,
  BroadcastTeamNoticeModal,
  ManagerApplyLeaveModal,
  ManagerFaceCheckInModal,
  RaiseRequisitionModal,
  RejectApprovalModal,
} from './ManagerModals';
import { mgrSharedStyles } from './ManagerSharedStyles';

interface ManagerPortalRootProps {
  onLogout?: () => void;
}

const HOME_SUB_TABS: {
  id: ManagerHomeSubTab;
  label: string;
}[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'team_shifts', label: 'Shifts' },
  { id: 'team_roster', label: 'Roster' },
  { id: 'approvals', label: 'Approvals' },
];

const BOTTOM_TABS: {
  id: ManagerBottomTab;
  label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'my_team', label: 'People', Icon: Users },
  { id: 'approvals', label: 'Approvals', Icon: ClipboardCheck },
  { id: 'performance', label: 'Performance', Icon: Award },
  { id: 'more', label: 'More', Icon: LayoutGrid },
];

function readSessionManagerIdentity(): {
  managerId: string;
  fullName: string;
  email: string;
} {
  const cached = authClient.getCachedUser();
  if (cached && cached.role === 'manager') {
    return {
      managerId:
        !cached.id || cached.id === 'usr-demo-001'
          ? 'MGR-104'
          : cached.id.toUpperCase(),
      fullName: cached.full_name || 'Ananya Verma',
      email: cached.email || 'ananya.verma@ofc360.com',
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
        if (parsed && parsed.role === 'manager') {
          return {
            managerId:
              !parsed.id || parsed.id === 'usr-demo-001'
                ? 'MGR-104'
                : parsed.id.toUpperCase(),
            fullName: parsed.full_name || 'Ananya Verma',
            email: parsed.email || 'ananya.verma@ofc360.com',
          };
        }
      }
    } catch {
      // Fallback to default manager persona
    }
  }
  return {
    managerId: 'MGR-104',
    fullName: 'Ananya Verma',
    email: 'ananya.verma@ofc360.com',
  };
}

const SSR_DEFAULT_MANAGER = {
  managerId: 'MGR-104',
  fullName: 'Ananya Verma',
  email: 'ananya.verma@ofc360.com',
};

const SSR_FALLBACK_STATE = createInitialManagerPortalState(SSR_DEFAULT_MANAGER);

const storeListeners = new Set<() => void>();
let snapshotCacheKey = '';
let snapshotCacheValue: ManagerPortalState = SSR_FALLBACK_STATE;

function subscribeManagerStore(listener: () => void): () => void {
  storeListeners.add(listener);
  const handleStorage = (ev: StorageEvent) => {
    if (
      !ev.key ||
      ev.key.startsWith('ofc360_manager_portal_state_v1_') ||
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

function getClientManagerSnapshot(): ManagerPortalState {
  const sessionId = readSessionManagerIdentity();
  const storageKey = `ofc360_manager_portal_state_v1_${sessionId.managerId}`;
  const raw =
    typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem(storageKey) || ''
      : '';
  const compositeKey = `${sessionId.managerId}::${sessionId.fullName}::${raw}`;
  if (snapshotCacheKey === compositeKey) {
    return snapshotCacheValue;
  }
  const loaded = loadManagerPortalState(sessionId);
  snapshotCacheKey = compositeKey;
  snapshotCacheValue = loaded;
  return loaded;
}

function getServerManagerSnapshot(): ManagerPortalState {
  return SSR_FALLBACK_STATE;
}

function mutateManagerStore(
  updater: (prev: ManagerPortalState) => ManagerPortalState
): void {
  const current = getClientManagerSnapshot();
  const next = updater(current);
  saveManagerPortalState(next);
  const storageKey = `ofc360_manager_portal_state_v1_${next.profile.managerId}`;
  const raw =
    typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem(storageKey) || ''
      : '';
  snapshotCacheKey = `${next.profile.managerId}::${next.profile.fullName}::${raw}`;
  snapshotCacheValue = next;
  storeListeners.forEach((l) => l());
}

function notifyEmployeeLocally(
  employeeId: string,
  title: string,
  message: string
): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const key = getEmployeePortalStorageKey(employeeId);
    const existingRaw = window.localStorage.getItem(key);
    if (!existingRaw) return;
    const empState = loadEmployeePortalState({ employeeId });
    saveEmployeePortalState({
      ...empState,
      notifications: [
        {
          id: `ENOT-${Date.now()}`,
          title,
          message,
          timestamp: 'Just now',
          category: 'Approval',
          read: false,
        },
        ...empState.notifications,
      ],
    });
  } catch {
    // Best-effort local sync
  }
}

export function ManagerPortalRoot({ onLogout }: ManagerPortalRootProps) {
  const router = useRouter();
  const portalState = useSyncExternalStore(
    subscribeManagerStore,
    getClientManagerSnapshot,
    getServerManagerSnapshot
  );

  const [isDark, setIsDark] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<ManagerBottomTab>('home');
  const [activeHomeTab, setActiveHomeTab] = useState<ManagerHomeSubTab>('overview');
  const [activeMoreModule, setActiveMoreModule] =
    useState<ManagerMoreModuleId | null>(null);

  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [rejectApprovalId, setRejectApprovalId] = useState<string | null>(null);
  const [isAssignRosterOpen, setIsAssignRosterOpen] = useState(false);
  const [isRaiseReqOpen, setIsRaiseReqOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
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
      document.title = 'OFC360 – Manager Workspace';
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, [isDark]);

  const scopedMembers = useMemo(
    () => scopeTeamByManager(portalState.allTeamMembers, portalState.profile.managerId),
    [portalState.allTeamMembers, portalState.profile.managerId]
  );

  const unreadNotificationsCount = useMemo(
    () => portalState.notifications.filter((n) => !n.read).length,
    [portalState.notifications]
  );

  const rejectTargetItem = useMemo(
    () =>
      rejectApprovalId
        ? portalState.approvals.find((a) => a.id === rejectApprovalId) || null
        : null,
    [portalState.approvals, rejectApprovalId]
  );

  const handleSelectBottomTab = (tab: ManagerBottomTab) => {
    setActiveBottomTab(tab);
    if (tab !== 'more') {
      setActiveMoreModule(null);
    }
  };

  const handleOpenMoreModule = (mod: ManagerMoreModuleId) => {
    setActiveBottomTab('more');
    setActiveMoreModule(mod);
  };

  const handleApproveItem = (approvalId: string) => {
    const target = portalState.approvals.find((a) => a.id === approvalId);
    mutateManagerStore((prev) => {
      const res = applyManagerApprovalDecision(prev.approvals, approvalId, 'Approved');
      return {
        ...prev,
        approvals: res.items,
        notifications: target
          ? [
              {
                id: `MNOT-${Date.now()}`,
                title: `Approved ${target.employeeName}`,
                message: `${target.requestTitle} (${target.dateRange}) marked Approved.`,
                timestamp: 'Just now',
                category: 'Approvals',
                read: true,
              },
              ...prev.notifications,
            ]
          : prev.notifications,
      };
    });
    if (target) {
      notifyEmployeeLocally(
        target.employeeId,
        `${target.category} Request Approved`,
        `Manager ${portalState.profile.fullName} approved: ${target.requestTitle}.`
      );
      showToast(`Approved ${target.employeeName} · ${target.requestTitle}`);
    }
  };

  const handleConfirmReject = (
    approvalId: string,
    remark: string
  ): { valid: boolean; error?: string } => {
    const target = portalState.approvals.find((a) => a.id === approvalId);
    const check = applyManagerApprovalDecision(
      portalState.approvals,
      approvalId,
      'Rejected',
      remark
    );
    if (!check.valid) {
      return { valid: false, error: check.error };
    }
    mutateManagerStore((prev) => ({
      ...prev,
      approvals: check.items,
    }));
    if (target) {
      notifyEmployeeLocally(
        target.employeeId,
        `${target.category} Request Declined`,
        `Manager remark: ${remark.trim()}`
      );
      showToast(`Rejected ${target.employeeName} request with remark`);
    }
    return { valid: true };
  };

  const handleRegularizePunch = (
    employeeId: string,
    nextStatus: TeamAttendanceStatus,
    reason: string
  ): { valid: boolean; error?: string } => {
    const res = regularizeMemberAttendance(
      portalState.allTeamMembers,
      employeeId,
      nextStatus,
      reason
    );
    if (!res.valid) {
      return { valid: false, error: res.error };
    }
    mutateManagerStore((prev) => ({
      ...prev,
      allTeamMembers: res.members,
    }));
    showToast(`Attendance regularized to ${nextStatus}`);
    return { valid: true };
  };

  const handleAssignRosterCell = (
    employeeId: string,
    dayKey: RosterDayKey,
    shiftType: ManagerShiftType
  ) => {
    mutateManagerStore((prev) => {
      const next = assignTeamRosterShift(
        prev.rosterRows,
        prev.allTeamMembers,
        employeeId,
        dayKey,
        shiftType
      );
      return {
        ...prev,
        rosterRows: next.rosterRows,
        allTeamMembers: next.members,
      };
    });
    showToast(`Updated ${dayKey} roster to ${shiftType}`);
  };

  const handleConfirmModalAssign = (payload: {
    employeeId: string;
    dayScope: RosterDayKey | 'Weekdays';
    shiftType: ManagerShiftType;
  }) => {
    const targetDays: RosterDayKey[] =
      payload.dayScope === 'Weekdays'
        ? ROSTER_DAYS_OF_WEEK.slice(0, 5)
        : [payload.dayScope];

    mutateManagerStore((prev) => {
      let nextRoster = prev.rosterRows;
      let nextMembers = prev.allTeamMembers;
      for (const dayKey of targetDays) {
        const res = assignTeamRosterShift(
          nextRoster,
          nextMembers,
          payload.employeeId,
          dayKey,
          payload.shiftType
        );
        nextRoster = res.rosterRows;
        nextMembers = res.members;
      }
      return {
        ...prev,
        rosterRows: nextRoster,
        allTeamMembers: nextMembers,
      };
    });
    showToast(`Assigned ${payload.shiftType} (${SHIFT_TIMINGS_MAP[payload.shiftType]})`);
  };

  const handleAddOneOnOneNote = (goalId: string, summary: string) => {
    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
    mutateManagerStore((prev) => ({
      ...prev,
      teamGoals: prev.teamGoals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              oneOnOneNotes: [
                ...g.oneOnOneNotes,
                {
                  id: `NOTE-${Date.now()}`,
                  date: todayStr,
                  summary,
                },
              ],
            }
          : g
      ),
    }));
    showToast('1-on-1 coaching note recorded');
  };

  const handleSubmitAppraisal = (
    appraisalId: string,
    rating: number,
    feedback: string
  ) => {
    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
    mutateManagerStore((prev) => ({
      ...prev,
      appraisals: prev.appraisals.map((a) =>
        a.id === appraisalId
          ? {
              ...a,
              rating,
              feedback,
              status: 'Submitted',
              updatedAt: todayStr,
            }
          : a
      ),
    }));
    showToast(`Appraisal submitted (${rating}/5)`);
  };

  const handleConfirmRequisition = (payload: {
    title: string;
    headcount: number;
    priority: 'Critical' | 'High' | 'Standard';
    hiringMode: 'Full-Time' | 'Contract';
  }) => {
    const newId = `REQ-${Math.floor(410 + Math.random() * 580)}`;
    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
    mutateManagerStore((prev) => ({
      ...prev,
      requisitions: [
        {
          id: newId,
          managerId: prev.profile.managerId,
          department: prev.profile.departmentName,
          title: payload.title,
          headcount: payload.headcount,
          priority: payload.priority,
          hiringMode: payload.hiringMode,
          status: 'Open',
          createdAt: todayStr,
        },
        ...prev.requisitions,
      ],
    }));
    showToast(`Requisition ${newId} raised for ${payload.headcount} opening(s)`);
  };

  const handleSubmitCandidateScorecard = (payload: {
    candidateId: string;
    decision: 'Hire' | 'Hold' | 'Reject';
    rating: number;
    notes: string;
  }) => {
    mutateManagerStore((prev) => ({
      ...prev,
      candidates: prev.candidates.map((c) =>
        c.id === payload.candidateId
          ? {
              ...c,
              stage: 'Decision Recorded',
              decision: payload.decision,
              scorecardRating: payload.rating,
              scorecardNotes: payload.notes,
            }
          : c
      ),
    }));
    showToast(`Candidate decision saved: ${payload.decision}`);
  };

  const handleConfirmBroadcast = (payload: {
    title: string;
    category: 'Company News' | 'Policy Update' | 'IT & Security' | 'Events';
    priority: 'High' | 'Normal';
    description: string;
  }) => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const expiryIso = new Date(Date.now() + 14 * 86400 * 1000).toISOString().slice(0, 10);
    mutateManagerStore((prev) => ({
      ...prev,
      announcements: [
        {
          id: `ANN-MGR-${Date.now().toString().slice(-4)}`,
          title: payload.title,
          category: payload.category,
          department: prev.profile.departmentName,
          targetAudience: `${prev.profile.departmentName} Direct Reports`,
          priority: payload.priority,
          publishedDate: todayIso,
          expiryDate: expiryIso,
          author: `${prev.profile.fullName} (Manager)`,
          status: 'Published',
          description: payload.description,
        },
        ...prev.announcements,
      ],
    }));
    showToast(`Team notice "${payload.title}" broadcast`);
  };

  const handleExportTeamReport = () => {
    showToast(
      `Exported CSV summary for ${scopedMembers.length} ${portalState.profile.departmentName} members`
    );
  };

  const handleSelfPunch = (payload: {
    action: 'Check-In' | 'Check-Out';
    workMode: 'Office' | 'WFH';
  }) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    mutateManagerStore((prev) => ({
      ...prev,
      selfService: {
        ...prev.selfService,
        todayStatus: payload.action === 'Check-In' ? 'Checked In' : 'Checked Out',
        checkInTime:
          payload.action === 'Check-In'
            ? timeStr
            : prev.selfService.checkInTime || timeStr,
        checkInIso:
          payload.action === 'Check-In'
            ? now.toISOString()
            : prev.selfService.checkInIso,
        checkOutTime: payload.action === 'Check-Out' ? timeStr : null,
        workMode: payload.workMode,
      },
    }));
    showToast(`Self ${payload.action} verified (${payload.workMode}) at ${timeStr}`);
  };

  const handleSelfApplyLeave = (payload: {
    leaveKey: string;
    leaveType: string;
    fromDate: string;
    toDate: string;
    days: number;
    reason: string;
  }) => {
    mutateManagerStore((prev) => ({
      ...prev,
      selfService: {
        ...prev.selfService,
        leaveBalances: prev.selfService.leaveBalances.map((b) =>
          b.key === payload.leaveKey
            ? {
                ...b,
                used: b.used + payload.days,
                remaining: Math.max(0, b.remaining - payload.days),
              }
            : b
        ),
        personalLeaveRequests: [
          {
            id: `MLEV-${Date.now().toString().slice(-3)}`,
            leaveType: payload.leaveType,
            fromDate: payload.fromDate,
            toDate: payload.toDate,
            days: payload.days,
            reason: payload.reason,
            status: 'Pending',
          },
          ...prev.selfService.personalLeaveRequests,
        ],
      },
    }));
    showToast(`Personal ${payload.leaveType} (${payload.days}d) submitted`);
  };

  const handleSaveProfile = (patch: { phone: string; location: string }) => {
    mutateManagerStore((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        phone: patch.phone || prev.profile.phone,
        location: patch.location || prev.profile.location,
      },
    }));
    showToast('Manager profile updated');
  };

  const handleMarkNotificationsRead = () => {
    mutateManagerStore((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const handleLogout = () => {
    authClient.clearSession();
    void authClient.logout();
    if (onLogout) {
      onLogout();
      return;
    }
    router.push('/login');
  };

  const searchEntries = useMemo<SearchableEntry[]>(
    () => [
      ...scopedMembers.map((m) => ({
        id: `mgr-mem-${m.employeeId}`,
        title: m.fullName,
        subtitle: `${m.designation} · ${m.todayStatus}`,
        group: 'Team',
        onSelect: () => setActiveBottomTab('my_team'),
      })),
      {
        id: 'mgr-act-roster',
        title: 'Assign Shift / Roster',
        subtitle: 'Schedule weekly team shifts',
        group: 'Action',
        onSelect: () => setIsAssignRosterOpen(true),
      },
      {
        id: 'mgr-act-req',
        title: 'Raise Hiring Requisition',
        subtitle: 'Open a new role for your department',
        group: 'Action',
        onSelect: () => setIsRaiseReqOpen(true),
      },
      {
        id: 'mgr-act-notice',
        title: 'Broadcast Team Notice',
        subtitle: 'Send update to direct reports',
        group: 'Action',
        onSelect: () => setIsBroadcastOpen(true),
      },
    ],
    [scopedMembers]
  );

  const messageItems = useMemo<MessagePreviewItem[]>(
    () =>
      portalState.announcements.map((a) => ({
        id: a.id,
        title: a.title,
        body: a.description,
        meta: `${a.category} · ${a.publishedDate}`,
      })),
    [portalState.announcements]
  );

  return (
    <div
      data-testid="ofc360-manager-portal"
      className="min-h-dvh w-full bg-[#F3F2EF] text-[#171717] flex flex-col"
    >
      <LinkedInHeader<ManagerBottomTab>
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
        {activeBottomTab === 'home' ? (
          <div className="flex flex-col gap-2 md:gap-3">
            <div className="w-full md:rounded-lg md:overflow-hidden md:border md:border-[#E5E7EB]">
              <LinkedInTopTabs
                tabs={HOME_SUB_TABS}
                activeTab={activeHomeTab}
                onSelect={setActiveHomeTab}
                ariaLabel="Manager workspace sections"
              />
            </div>

            <div className="px-4 md:px-0">
              {activeHomeTab === 'overview' ? (
                <ManagerOverviewTab
                  state={portalState}
                  isDark={isDark}
                  onSelectHomeTab={setActiveHomeTab}
                  onNavigateBottom={handleSelectBottomTab}
                  onOpenMoreModule={handleOpenMoreModule}
                  onApproveItem={handleApproveItem}
                  onOpenRejectModal={(id) => setRejectApprovalId(id)}
                />
              ) : null}

              {activeHomeTab === 'team_shifts' ? (
                <ManagerTeamShiftsView
                  members={portalState.allTeamMembers}
                  approvals={portalState.approvals}
                  managerId={portalState.profile.managerId}
                  isDark={isDark}
                  onOpenAssignShiftModal={() => setIsAssignRosterOpen(true)}
                  onApproveSwap={handleApproveItem}
                  onOpenRejectSwap={(id) => setRejectApprovalId(id)}
                />
              ) : null}

              {activeHomeTab === 'team_roster' ? (
                <ManagerTeamRosterView
                  rosterRows={portalState.rosterRows}
                  managerId={portalState.profile.managerId}
                  isDark={isDark}
                  onAssignRosterCell={handleAssignRosterCell}
                  onOpenAssignShiftModal={() => setIsAssignRosterOpen(true)}
                />
              ) : null}

              {activeHomeTab === 'approvals' ? (
                <ManagerApprovalsTab
                  approvals={portalState.approvals}
                  managerId={portalState.profile.managerId}
                  isDark={isDark}
                  onApproveItem={handleApproveItem}
                  onOpenRejectModal={(id) => setRejectApprovalId(id)}
                />
              ) : null}
            </div>
          </div>
        ) : null}

        {activeBottomTab === 'my_team' ? (
          <div className="px-4 py-3 md:p-0">
            <ManagerMyTeamTab
              members={portalState.allTeamMembers}
              managerId={portalState.profile.managerId}
              isDark={isDark}
              onRegularizePunch={handleRegularizePunch}
            />
          </div>
        ) : null}

        {activeBottomTab === 'approvals' ? (
          <div className="px-4 py-3 md:p-0">
            <ManagerApprovalsTab
              approvals={portalState.approvals}
              managerId={portalState.profile.managerId}
              isDark={isDark}
              onApproveItem={handleApproveItem}
              onOpenRejectModal={(id) => setRejectApprovalId(id)}
            />
          </div>
        ) : null}

        {activeBottomTab === 'performance' ? (
          <div className="px-4 py-3 md:p-0">
            <ManagerPerformanceTab
              goals={portalState.teamGoals}
              appraisals={portalState.appraisals}
              managerId={portalState.profile.managerId}
              isDark={isDark}
              onAddOneOnOneNote={handleAddOneOnOneNote}
              onSubmitAppraisal={handleSubmitAppraisal}
            />
          </div>
        ) : null}

        {activeBottomTab === 'more' ? (
          <div className="px-4 py-3 md:p-0">
            <ManagerMoreTab
              state={portalState}
              activeModule={activeMoreModule}
              isDark={isDark}
              onSelectModule={setActiveMoreModule}
              onToggleDarkMode={setIsDark}
              onOpenRaiseRequisition={() => setIsRaiseReqOpen(true)}
              onSubmitCandidateScorecard={handleSubmitCandidateScorecard}
              onOpenSelfCheckIn={() => setIsSelfCheckInOpen(true)}
              onOpenSelfLeaveModal={() => setIsSelfLeaveOpen(true)}
              onOpenBroadcastNotice={() => setIsBroadcastOpen(true)}
              onExportTeamReport={handleExportTeamReport}
              onNavigatePersonalPortal={() => router.push('/dashboard/employee')}
              onSaveProfile={handleSaveProfile}
              onLogout={handleLogout}
            />
          </div>
        ) : null}
      </main>

      <LinkedInBottomNav<ManagerBottomTab>
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

        {/* Quick Create (+) Bottom Sheet Modal */}
        <Modal
          visible={isQuickCreateOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsQuickCreateOpen(false)}
        >
          <Pressable
            onPress={() => setIsQuickCreateOpen(false)}
            style={[mgrSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}
          >
            <View
              style={[
                mgrSharedStyles.modalSheet,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <View style={mgrSharedStyles.dragHandleWrap}>
                <View style={[mgrSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
              </View>
              <Text style={[mgrSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                Quick Manager Actions
              </Text>
              <Text style={[mgrSharedStyles.metaText, { color: palette.textMuted, marginBottom: 14 }]}>
                Manage team schedules, hiring, notices, or personal check-in
              </Text>

              <View style={styles.quickSheetList}>
                <Pressable
                  accessibilityLabel="Quick Action Assign Shift or Roster"
                  onPress={() => {
                    setIsQuickCreateOpen(false);
                    setIsAssignRosterOpen(true);
                  }}
                  style={[
                    styles.quickSheetItem,
                    { backgroundColor: palette.inputBg, borderColor: palette.border },
                  ]}
                >
                  <CalendarClock size={18} color={palette.primary} strokeWidth={2.2} />
                  <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    Assign Shift / Roster
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityLabel="Quick Action Raise Hiring Requisition"
                  onPress={() => {
                    setIsQuickCreateOpen(false);
                    setIsRaiseReqOpen(true);
                  }}
                  style={[
                    styles.quickSheetItem,
                    { backgroundColor: palette.inputBg, borderColor: palette.border },
                  ]}
                >
                  <Briefcase size={18} color={palette.violet} strokeWidth={2.2} />
                  <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    Raise Hiring Requisition
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityLabel="Quick Action Broadcast Team Notice"
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
                  <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    Broadcast Team Notice
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityLabel="Quick Action Self Check-In"
                  onPress={() => {
                    setIsQuickCreateOpen(false);
                    setIsSelfCheckInOpen(true);
                  }}
                  style={[
                    styles.quickSheetItem,
                    { backgroundColor: palette.inputBg, borderColor: palette.border },
                  ]}
                >
                  <ScanFace size={18} color={palette.emerald} strokeWidth={2.2} />
                  <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    Self-Check-In
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
            style={[mgrSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}
          >
            <View
              style={[
                mgrSharedStyles.modalSheet,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <View style={mgrSharedStyles.dragHandleWrap}>
                <View style={[mgrSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
              </View>
              <View style={mgrSharedStyles.modalHeaderRow}>
                <Text style={[mgrSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                  Notifications ({portalState.notifications.length})
                </Text>
                {unreadNotificationsCount > 0 ? (
                  <Pressable
                    accessibilityLabel="Mark all notifications read"
                    onPress={handleMarkNotificationsRead}
                  >
                    <Text style={[mgrSharedStyles.linkText, { color: palette.primary }]}>
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
                      <Text style={[mgrSharedStyles.subTitle, { color: palette.textPrimary }]}>
                        {n.title}
                      </Text>
                      <Text style={[mgrSharedStyles.metaText, { color: palette.textSecondary }]}>
                        {n.message}
                      </Text>
                      <Text
                        style={[
                          mgrSharedStyles.metaText,
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

        {/* Functional Manager Modals */}
        <RejectApprovalModal
          visible={Boolean(rejectTargetItem)}
          approvalItem={rejectTargetItem}
          isDark={isDark}
          onClose={() => setRejectApprovalId(null)}
          onConfirmReject={handleConfirmReject}
        />

        <AssignRosterModal
          visible={isAssignRosterOpen}
          members={scopedMembers}
          isDark={isDark}
          onClose={() => setIsAssignRosterOpen(false)}
          onConfirmAssign={handleConfirmModalAssign}
        />

        <RaiseRequisitionModal
          visible={isRaiseReqOpen}
          departmentName={portalState.profile.departmentName}
          isDark={isDark}
          onClose={() => setIsRaiseReqOpen(false)}
          onConfirmRequisition={handleConfirmRequisition}
        />

        <BroadcastTeamNoticeModal
          visible={isBroadcastOpen}
          departmentName={portalState.profile.departmentName}
          isDark={isDark}
          onClose={() => setIsBroadcastOpen(false)}
          onConfirmBroadcast={handleConfirmBroadcast}
        />

        <ManagerFaceCheckInModal
          visible={isSelfCheckInOpen}
          isDark={isDark}
          profile={portalState.profile}
          selfService={portalState.selfService}
          onClose={() => setIsSelfCheckInOpen(false)}
          onSubmitPunch={handleSelfPunch}
        />

        <ManagerApplyLeaveModal
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
  plainIconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 9,
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
    gap: 16,
  },
  tabSegmentBar: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 3,
    gap: 2,
  },
  segmentButton: {
    flexGrow: 1,
    minHeight: 40,
    flexDirection: 'row',
    gap: 3,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  segmentButtonText: {
    fontFamily: FONT_SANS,
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: -0.2,
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
