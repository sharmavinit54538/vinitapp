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
  Home,
  Laptop,
  LayoutGrid,
  LifeBuoy,
  QrCode,
  UserPlus,
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
import { Ofc360Role } from '@/lib/auth-schemas';
import { authClient } from '@/lib/auth-api';
import {
  ItAdminBottomTab,
  ItAdminHomeSubTab,
  ItAdminMoreModuleId,
  ItAdminPortalState,
  ItAssetCategory,
  ItAssetCondition,
  ItAssetItem,
  ItHelpdeskTicket,
  ItSecurityPolicyConfig,
  ItTicketPriority,
  ItTicketStatus,
  applyTicketReplyAndStatus,
  assignAssetToEmployee,
  confirmExitAssetReturn,
  createInitialItAdminPortalState,
  getItAdminPortalStorageKey,
  loadItAdminPortalState,
  logAssetRepair,
  returnAssetToPool,
  saveItAdminPortalState,
  signOffOffboardingClearance,
} from '@/lib/it-admin-portal-logic';
import { FONT_SANS, getPalette } from '../../theme/colors';
import { ItAdminOverviewTab } from './ItAdminOverviewTab';
import { ItAdminAssetsTab } from './ItAdminAssetsTab';
import { ItAdminTicketsTab } from './ItAdminTicketsTab';
import { ItAdminAccessTab } from './ItAdminAccessTab';
import { ItAdminMoreTab } from './ItAdminMoreTab';
import {
  AddEditAssetModal,
  AssignAssetModal,
  CreateItTicketModal,
  ItSelfApplyLeaveModal,
  ItSelfCheckInModal,
  LogRepairModal,
  ProvisionUserModal,
  QrGeneratorScannerModal,
} from './ItAdminModals';
import { itSharedStyles } from './ItAdminSharedStyles';

interface ItAdminPortalRootProps {
  onLogout?: () => void;
}

const HOME_SUB_TABS: {
  id: ItAdminHomeSubTab;
  label: string;
}[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'assets', label: 'Assets' },
  { id: 'helpdesk', label: 'Helpdesk' },
  { id: 'access_security', label: 'Security' },
];

const BOTTOM_TABS: {
  id: ItAdminBottomTab;
  label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'assets', label: 'Assets', Icon: Laptop },
  { id: 'tickets', label: 'Tickets', Icon: LifeBuoy },
  { id: 'users_rbac', label: 'Access', Icon: Users },
  { id: 'more', label: 'More', Icon: LayoutGrid },
];

function readSessionItAdminIdentity(): {
  itAdminId: string;
  fullName: string;
  email: string;
} {
  const cached = authClient.getCachedUser();
  if (cached && cached.role === 'it_admin') {
    return {
      itAdminId:
        !cached.id || cached.id === 'usr-demo-001'
          ? 'IT-302'
          : cached.id.toUpperCase(),
      fullName: cached.full_name || 'Vikram Deshpande',
      email: cached.email || 'itadmin@ofc360.com',
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
        if (parsed && parsed.role === 'it_admin') {
          return {
            itAdminId:
              !parsed.id || parsed.id === 'usr-demo-001'
                ? 'IT-302'
                : parsed.id.toUpperCase(),
            fullName: parsed.full_name || 'Vikram Deshpande',
            email: parsed.email || 'itadmin@ofc360.com',
          };
        }
      }
    } catch {
      // Fallback to default IT Admin persona
    }
  }
  return {
    itAdminId: 'IT-302',
    fullName: 'Vikram Deshpande',
    email: 'itadmin@ofc360.com',
  };
}

const SSR_DEFAULT_IT_ADMIN = {
  itAdminId: 'IT-302',
  fullName: 'Vikram Deshpande',
  email: 'itadmin@ofc360.com',
};

const SSR_FALLBACK_STATE = createInitialItAdminPortalState(SSR_DEFAULT_IT_ADMIN);

const storeListeners = new Set<() => void>();
let snapshotCacheKey = '';
let snapshotCacheValue: ItAdminPortalState = SSR_FALLBACK_STATE;

function subscribeItAdminStore(listener: () => void): () => void {
  storeListeners.add(listener);
  const handleStorage = (ev: StorageEvent) => {
    if (
      !ev.key ||
      ev.key.startsWith('ofc360_it_admin_portal_state_v1_') ||
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

function getClientItAdminSnapshot(): ItAdminPortalState {
  const sessionId = readSessionItAdminIdentity();
  const storageKey = getItAdminPortalStorageKey(sessionId.itAdminId);
  const raw =
    typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem(storageKey) || ''
      : '';
  const compositeKey = `${sessionId.itAdminId}::${sessionId.fullName}::${raw}`;
  if (snapshotCacheKey === compositeKey) {
    return snapshotCacheValue;
  }
  const loaded = loadItAdminPortalState(sessionId);
  snapshotCacheKey = compositeKey;
  snapshotCacheValue = loaded;
  return loaded;
}

function getServerItAdminSnapshot(): ItAdminPortalState {
  return SSR_FALLBACK_STATE;
}

function mutateItAdminStore(
  updater: (prev: ItAdminPortalState) => ItAdminPortalState
): void {
  const current = getClientItAdminSnapshot();
  const next = updater(current);
  saveItAdminPortalState(next);
  const storageKey = getItAdminPortalStorageKey(next.profile.itAdminId);
  const raw =
    typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem(storageKey) || ''
      : '';
  snapshotCacheKey = `${next.profile.itAdminId}::${next.profile.fullName}::${raw}`;
  snapshotCacheValue = next;
  storeListeners.forEach((l) => l());
}

export function ItAdminPortalRoot({ onLogout }: ItAdminPortalRootProps) {
  const router = useRouter();
  const portalState = useSyncExternalStore(
    subscribeItAdminStore,
    getClientItAdminSnapshot,
    getServerItAdminSnapshot
  );

  const [isDark, setIsDark] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<ItAdminBottomTab>('home');
  const [activeHomeTab, setActiveHomeTab] = useState<ItAdminHomeSubTab>('overview');
  const [activeMoreModule, setActiveMoreModule] =
    useState<ItAdminMoreModuleId | null>(null);

  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isAddEditAssetOpen, setIsAddEditAssetOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ItAssetItem | null>(null);
  const [isAssignAssetOpen, setIsAssignAssetOpen] = useState(false);
  const [assignTargetAsset, setAssignTargetAsset] = useState<ItAssetItem | null>(null);
  const [qrModalConfig, setQrModalConfig] = useState<{
    open: boolean;
    mode: 'sticker' | 'scan';
    asset: ItAssetItem | null;
  }>({ open: false, mode: 'sticker', asset: null });
  const [repairAsset, setRepairAsset] = useState<ItAssetItem | null>(null);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [isProvisionUserOpen, setIsProvisionUserOpen] = useState(false);
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
      document.title = 'OFC360 – IT Admin Operations';
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, [isDark]);

  const unreadNotificationsCount = useMemo(
    () => portalState.notifications.filter((n) => !n.read).length,
    [portalState.notifications]
  );

  const handleSelectBottomTab = (tab: ItAdminBottomTab) => {
    setActiveBottomTab(tab);
    if (tab !== 'more') {
      setActiveMoreModule(null);
    }
  };

  const handleOpenMoreModule = (mod: ItAdminMoreModuleId) => {
    setActiveBottomTab('more');
    setActiveMoreModule(mod);
  };

  const appendAuditLog = (
    prev: ItAdminPortalState,
    entry: {
      category: ItAdminPortalState['auditLogs'][number]['category'];
      action: string;
      target: string;
      severity?: 'Info' | 'Warning' | 'Critical';
    }
  ) => [
    {
      id: `AUD-${Date.now().toString().slice(-5)}`,
      category: entry.category,
      actorName: prev.profile.fullName,
      action: entry.action,
      target: entry.target,
      timestamp: 'Just now',
      severity: entry.severity || 'Info',
    },
    ...prev.auditLogs,
  ];

  // ASSET HANDLERS
  const handleSaveAsset = (payload: {
    id?: string;
    assetTag: string;
    category: ItAssetCategory;
    brandModel: string;
    serialNumber: string;
    purchaseDate: string;
    warrantyExpiry: string;
    condition: ItAssetCondition;
    location: string;
  }) => {
    mutateItAdminStore((prev) => {
      const exists = Boolean(payload.id);
      const nextAssets: ItAssetItem[] = exists
        ? prev.assets.map((a) =>
            a.id === payload.id
              ? {
                  ...a,
                  assetTag: payload.assetTag,
                  category: payload.category,
                  brandModel: payload.brandModel,
                  serialNumber: payload.serialNumber,
                  purchaseDate: payload.purchaseDate,
                  warrantyExpiry: payload.warrantyExpiry,
                  condition: payload.condition,
                  location: payload.location,
                  qrPayload: `OFC360:ASSET:${payload.assetTag}`,
                }
              : a
          )
        : [
            {
              id: `AST-${Date.now().toString().slice(-4)}`,
              assetTag: payload.assetTag,
              category: payload.category,
              brandModel: payload.brandModel,
              serialNumber: payload.serialNumber,
              purchaseDate: payload.purchaseDate,
              warrantyExpiry: payload.warrantyExpiry,
              condition: payload.condition,
              status: payload.condition === 'Faulty' ? 'In Repair' : 'Available',
              location: payload.location,
              qrPayload: `OFC360:ASSET:${payload.assetTag}`,
              repairLogs: [],
            },
            ...prev.assets,
          ];
      return {
        ...prev,
        assets: nextAssets,
        auditLogs: appendAuditLog(prev, {
          category: 'Asset',
          action: exists ? 'Updated IT Asset Record' : 'Registered New IT Asset',
          target: `${payload.assetTag} · ${payload.brandModel}`,
        }),
      };
    });
    showToast(
      payload.id
        ? `Updated ${payload.assetTag}`
        : `Registered ${payload.assetTag} in IT inventory`
    );
  };

  const handleConfirmAssignAsset = (
    assetId: string,
    employee: { employeeId: string; fullName: string; department: string }
  ) => {
    const check = assignAssetToEmployee(portalState.assets, assetId, employee);
    if (!check.valid) return check;
    const target = portalState.assets.find((a) => a.id === assetId);
    mutateItAdminStore((prev) => ({
      ...prev,
      assets: check.assets,
      auditLogs: appendAuditLog(prev, {
        category: 'Asset',
        action: 'Assigned Hardware Asset',
        target: `${target?.assetTag || assetId} → ${employee.fullName} (${employee.employeeId})`,
      }),
    }));
    showToast(`Assigned ${target?.assetTag || 'asset'} to ${employee.fullName}`);
    return { valid: true };
  };

  const handleReturnAsset = (assetId: string) => {
    const target = portalState.assets.find((a) => a.id === assetId);
    mutateItAdminStore((prev) => ({
      ...prev,
      assets: returnAssetToPool(prev.assets, assetId, 'Good'),
      auditLogs: appendAuditLog(prev, {
        category: 'Asset',
        action: 'Checked In Returned Asset',
        target: `${target?.assetTag || assetId} returned to Available Pool`,
      }),
    }));
    showToast(`${target?.assetTag || 'Asset'} checked back into Available pool`);
  };

  const handleSubmitRepair = (
    assetId: string,
    payload: {
      vendor: string;
      issueSummary: string;
      costInr: number;
      markCompleted?: boolean;
    }
  ) => {
    const check = logAssetRepair(portalState.assets, assetId, payload);
    if (!check.valid) return check;
    const target = portalState.assets.find((a) => a.id === assetId);
    mutateItAdminStore((prev) => ({
      ...prev,
      assets: check.assets,
      auditLogs: appendAuditLog(prev, {
        category: 'Asset',
        action: payload.markCompleted
          ? 'Completed Hardware Repair'
          : 'Logged Vendor Hardware Repair',
        target: `${target?.assetTag || assetId} (${payload.vendor})`,
        severity: payload.markCompleted ? 'Info' : 'Warning',
      }),
    }));
    showToast(
      payload.markCompleted
        ? `${target?.assetTag} marked repaired`
        : `${target?.assetTag} sent for vendor repair`
    );
    return { valid: true };
  };

  const handleQuickQrStatusToggle = (assetId: string) => {
    const target = portalState.assets.find((a) => a.id === assetId);
    if (!target) return;
    if (target.status === 'Assigned') {
      handleReturnAsset(assetId);
      return;
    }
    const res = logAssetRepair(portalState.assets, assetId, {
      vendor: 'HQ IT Bench',
      issueSummary: 'Flagged via Mobile QR Scan check',
      costInr: 0,
      markCompleted: false,
    });
    if (res.valid) {
      mutateItAdminStore((prev) => ({ ...prev, assets: res.assets }));
      showToast(`${target.assetTag} flagged for bench check`);
    }
  };

  // HELPDESK HANDLERS
  const handleUpdateTicket = (
    ticketId: string,
    payload: {
      replyText?: string;
      isInternalNote?: boolean;
      nextStatus?: ItTicketStatus;
      assignToMe?: boolean;
    }
  ) => {
    const res = applyTicketReplyAndStatus(portalState.tickets, ticketId, {
      replyText: payload.replyText,
      isInternalNote: payload.isInternalNote,
      nextStatus: payload.nextStatus,
      assignToAgent: payload.assignToMe
        ? { id: portalState.profile.itAdminId, name: portalState.profile.fullName }
        : undefined,
      actorName: portalState.profile.fullName,
    });
    if (!res.valid) return res;
    const target = portalState.tickets.find((t) => t.id === ticketId);
    mutateItAdminStore((prev) => ({
      ...prev,
      tickets: res.tickets,
      auditLogs:
        payload.nextStatus === 'Resolved'
          ? appendAuditLog(prev, {
              category: 'Helpdesk',
              action: 'Resolved IT Support Ticket',
              target: `${target?.ticketNumber || ticketId} (${target?.employeeName || ''})`,
            })
          : prev.auditLogs,
    }));
    if (payload.nextStatus === 'Resolved') {
      showToast(`Ticket ${target?.ticketNumber || ''} marked Resolved`);
    } else if (payload.assignToMe) {
      showToast(`Assigned ${target?.ticketNumber || ''} to ${portalState.profile.fullName}`);
    } else if (payload.replyText) {
      showToast(payload.isInternalNote ? 'Internal IT note saved' : 'Public reply sent');
    }
    return { valid: true };
  };

  const handleCreateTicket = (payload: {
    subject: string;
    description: string;
    category: ItHelpdeskTicket['category'];
    priority: ItTicketPriority;
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
    department: string;
  }) => {
    const num = Math.floor(710 + Math.random() * 280);
    const ticketNumber = `IT-2026-${num}`;
    mutateItAdminStore((prev) => ({
      ...prev,
      tickets: [
        {
          id: `ITK-${num}`,
          ticketNumber,
          subject: payload.subject,
          description: payload.description,
          category: payload.category,
          priority: payload.priority,
          status: 'Open',
          employeeId: payload.employeeId,
          employeeName: payload.employeeName,
          employeeEmail: payload.employeeEmail,
          department: payload.department,
          slaCountdownHours: payload.priority === 'Critical' ? 2 : 8,
          slaTargetLabel: payload.priority === 'Critical' ? '2h 00m left' : '8h 00m left',
          createdAt: 'Just now',
          messages: [],
        },
        ...prev.tickets,
      ],
      auditLogs: appendAuditLog(prev, {
        category: 'Helpdesk',
        action: 'Created IT Support Ticket',
        target: `${ticketNumber} · ${payload.subject}`,
      }),
    }));
    showToast(`Ticket ${ticketNumber} created`);
  };

  // USER PROVISIONING, RBAC & SECURITY HANDLERS
  const handleProvisionUser = (payload: {
    fullName: string;
    email: string;
    employeeId: string;
    department: string;
    role: Ofc360Role;
    enrollBiometrics: boolean;
  }) => {
    mutateItAdminStore((prev) => ({
      ...prev,
      users: [
        {
          id: `USR-${Date.now().toString().slice(-4)}`,
          employeeId: payload.employeeId,
          fullName: payload.fullName,
          email: payload.email,
          department: payload.department,
          role: payload.role,
          accountStatus: 'Active',
          mfaEnabled: prev.securityPolicy.enforceMfaAllUsers,
          biometricEnrolled: payload.enrollBiometrics,
          toolsProvisioned: ['Google Workspace', 'Okta SSO', 'Slack'],
          activeSessionsCount: 0,
          lastActiveAt: 'Provisioned just now',
        },
        ...prev.users,
      ],
      auditLogs: appendAuditLog(prev, {
        category: 'Access & RBAC',
        action: `Provisioned ${payload.role} Account`,
        target: `${payload.fullName} (${payload.employeeId})`,
      }),
    }));
    showToast(`Provisioned ${payload.fullName} (${payload.role})`);
  };

  const handleToggleJoinerStep = (
    joinerId: string,
    step: 'emailCreated' | 'ssoProvisioned' | 'biometricSynced' | 'hardwareIssued'
  ) => {
    mutateItAdminStore((prev) => ({
      ...prev,
      newJoiners: prev.newJoiners.map((j) =>
        j.id === joinerId ? { ...j, [step]: !j[step] } : j
      ),
    }));
    showToast('New joiner IT checklist updated');
  };

  const handleCompleteJoinerSetup = (joinerId: string) => {
    const joiner = portalState.newJoiners.find((j) => j.id === joinerId);
    if (!joiner) return;
    mutateItAdminStore((prev) => ({
      ...prev,
      newJoiners: prev.newJoiners.map((j) =>
        j.id === joinerId
          ? {
              ...j,
              emailCreated: true,
              ssoProvisioned: true,
              biometricSynced: true,
              hardwareIssued: true,
              status: 'Completed',
            }
          : j
      ),
      users: prev.users.some((u) => u.employeeId === joiner.employeeId)
        ? prev.users
        : [
            {
              id: `USR-${Date.now().toString().slice(-4)}`,
              employeeId: joiner.employeeId,
              fullName: joiner.fullName,
              email: joiner.officialEmail,
              department: joiner.department,
              role: 'employee',
              accountStatus: 'Active',
              mfaEnabled: true,
              biometricEnrolled: true,
              toolsProvisioned: ['Google Workspace', 'Okta SSO', 'Slack'],
              activeSessionsCount: 0,
              lastActiveAt: 'Activated just now',
            },
            ...prev.users,
          ],
      auditLogs: appendAuditLog(prev, {
        category: 'Access & RBAC',
        action: 'Completed New Joiner IT Activation',
        target: `${joiner.fullName} (${joiner.employeeId})`,
      }),
    }));
    showToast(`${joiner.fullName} IT account & biometric setup activated`);
  };

  const handleChangeUserRole = (userId: string, role: Ofc360Role) => {
    const target = portalState.users.find((u) => u.id === userId);
    mutateItAdminStore((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, role } : u)),
      auditLogs: appendAuditLog(prev, {
        category: 'Access & RBAC',
        action: `Changed RBAC Role → ${role}`,
        target: `${target?.fullName || userId} (${target?.employeeId || ''})`,
        severity: role === 'it_admin' || role === 'hr_admin' ? 'Warning' : 'Info',
      }),
    }));
    showToast(`Updated ${target?.fullName || 'user'} role to ${role}`);
  };

  const handleToggleUserStatus = (userId: string) => {
    const target = portalState.users.find((u) => u.id === userId);
    const nextStatus =
      target?.accountStatus === 'Active' ? 'Suspended' : 'Active';
    mutateItAdminStore((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === userId
          ? {
              ...u,
              accountStatus: nextStatus,
              activeSessionsCount: nextStatus === 'Suspended' ? 0 : u.activeSessionsCount,
            }
          : u
      ),
      auditLogs: appendAuditLog(prev, {
        category: 'Security',
        action:
          nextStatus === 'Suspended'
            ? 'Suspended User Account'
            : 'Reactivated User Account',
        target: `${target?.fullName || userId} (${target?.employeeId || ''})`,
        severity: nextStatus === 'Suspended' ? 'Critical' : 'Info',
      }),
    }));
    showToast(`${target?.fullName || 'User'} is now ${nextStatus}`);
  };

  const handleForcePasswordReset = (userId: string) => {
    const target = portalState.users.find((u) => u.id === userId);
    mutateItAdminStore((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === userId ? { ...u, forcePasswordResetPending: true } : u
      ),
      auditLogs: appendAuditLog(prev, {
        category: 'Security',
        action: 'Triggered Force Password Reset',
        target: `${target?.email || userId}`,
        severity: 'Warning',
      }),
    }));
    showToast(`Force password reset queued for ${target?.email || 'user'}`);
  };

  const handleRevokeUserSessions = (userId: string) => {
    const target = portalState.users.find((u) => u.id === userId);
    mutateItAdminStore((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === userId ? { ...u, activeSessionsCount: 0 } : u
      ),
      auditLogs: appendAuditLog(prev, {
        category: 'Security',
        action: 'Revoked All Active User Sessions',
        target: `${target?.fullName || userId} (${target?.employeeId || ''})`,
        severity: 'Warning',
      }),
    }));
    showToast(`All active sessions revoked for ${target?.fullName || 'user'}`);
  };

  const handleUpdateSecurityPolicy = (patch: Partial<ItSecurityPolicyConfig>) => {
    mutateItAdminStore((prev) => ({
      ...prev,
      securityPolicy: { ...prev.securityPolicy, ...patch },
      auditLogs: appendAuditLog(prev, {
        category: 'Security',
        action: 'Updated Org Identity & Security Policy',
        target: Object.keys(patch).join(', '),
      }),
    }));
    showToast('Security & MFA policy updated');
  };

  // OFFBOARDING CLEARANCE & INTEGRATIONS HANDLERS
  const handleConfirmExitAssetReturn = (clearanceId: string, assetId: string) => {
    mutateItAdminStore((prev) => {
      const next = confirmExitAssetReturn(
        prev.offboardingClearances,
        prev.assets,
        clearanceId,
        assetId
      );
      return {
        ...prev,
        offboardingClearances: next.clearances,
        assets: next.assets,
        auditLogs: appendAuditLog(prev, {
          category: 'Clearance',
          action: 'Confirmed Exit Hardware Return',
          target: `Asset ${assetId} returned to IT pool`,
        }),
      };
    });
    showToast(`Exit hardware ${assetId} returned to Available pool`);
  };

  const handleToggleClearanceAccessStep = (
    clearanceId: string,
    step: 'ssoRevoked' | 'emailArchived' | 'badgeDeactivated'
  ) => {
    mutateItAdminStore((prev) => ({
      ...prev,
      offboardingClearances: prev.offboardingClearances.map((c) =>
        c.id === clearanceId ? { ...c, [step]: !c[step] } : c
      ),
    }));
    showToast('Access revocation step updated');
  };

  const handleSignOffClearance = (clearanceId: string) => {
    const res = signOffOffboardingClearance(
      portalState.offboardingClearances,
      clearanceId,
      portalState.profile.fullName
    );
    if (!res.valid) return res;
    const clr = portalState.offboardingClearances.find((c) => c.id === clearanceId);
    mutateItAdminStore((prev) => ({
      ...prev,
      offboardingClearances: res.clearances,
      auditLogs: appendAuditLog(prev, {
        category: 'Clearance',
        action: 'Signed Off IT Offboarding Clearance',
        target: `${clr?.fullName || clearanceId} (${clr?.employeeId || ''})`,
      }),
    }));
    showToast(`IT Clearance signed off for ${clr?.fullName || 'employee'}`);
    return { valid: true };
  };

  const handleTestIntegrationSync = (integrationId: string) => {
    const target = portalState.integrations.find((i) => i.id === integrationId);
    mutateItAdminStore((prev) => ({
      ...prev,
      integrations: prev.integrations.map((i) =>
        i.id === integrationId
          ? { ...i, status: 'Connected', lastSyncedAt: 'Just now' }
          : i
      ),
      auditLogs: appendAuditLog(prev, {
        category: 'Security',
        action: 'Synchronized External Integration',
        target: target?.name || integrationId,
      }),
    }));
    showToast(`${target?.name || 'Integration'} synced successfully`);
  };

  // SELF-SERVICE & PROFILE HANDLERS
  const handleSelfPunch = (payload: {
    action: 'Check-In' | 'Check-Out';
    workMode: 'Office' | 'WFH';
  }) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    mutateItAdminStore((prev) => ({
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
    mutateItAdminStore((prev) => ({
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
            id: `ITLEV-${Date.now().toString().slice(-3)}`,
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
    mutateItAdminStore((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        phone: patch.phone || prev.profile.phone,
        location: patch.location || prev.profile.location,
      },
    }));
    showToast('IT Admin profile updated');
  };

  const handleMarkNotificationsRead = () => {
    mutateItAdminStore((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const handleLogout = () => {
    authClient.clearSession();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem('ofc360_local_auth_user_v1');
      } catch {
        // Ignore storage errors
      }
    }
    void authClient.logout();
    if (onLogout) {
      onLogout();
      return;
    }
    router.push('/login');
  };

  const searchEntries = useMemo<SearchableEntry[]>(
    () => [
      ...portalState.assets.slice(0, 6).map((a) => ({
        id: `it-ast-${a.id}`,
        title: `${a.assetTag} · ${a.brandModel}`,
        subtitle: `${a.category} · ${a.status}`,
        group: 'Asset',
        onSelect: () => setActiveBottomTab('assets'),
      })),
      ...portalState.tickets.slice(0, 6).map((t) => ({
        id: `it-tkt-${t.id}`,
        title: `${t.ticketNumber} · ${t.subject}`,
        subtitle: `${t.employeeName} · ${t.status}`,
        group: 'Ticket',
        onSelect: () => setActiveBottomTab('tickets'),
      })),
      {
        id: 'it-act-provision',
        title: 'Provision User Account',
        subtitle: 'Create employee IT & RBAC profile',
        group: 'Action',
        onSelect: () => setIsProvisionUserOpen(true),
      },
    ],
    [portalState.assets, portalState.tickets]
  );

  const messageItems = useMemo<MessagePreviewItem[]>(
    () =>
      portalState.notifications.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.message,
        meta: `${n.category} · ${n.timestamp}`,
      })),
    [portalState.notifications]
  );

  return (
    <div
      data-testid="ofc360-it-admin-portal"
      className="min-h-dvh w-full bg-[#F3F2EF] text-[#171717] flex flex-col"
    >
      <LinkedInHeader<ItAdminBottomTab>
        userName={portalState.profile.fullName}
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={0}
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
                ariaLabel="IT Admin workspace sections"
              />
            </div>

            <div className="px-4 md:px-0">
              {activeHomeTab === 'overview' ? (
                <ItAdminOverviewTab
                  state={portalState}
                  isDark={isDark}
                  onSelectHomeTab={setActiveHomeTab}
                  onNavigateBottom={handleSelectBottomTab}
                  onOpenMoreModule={handleOpenMoreModule}
                  onOpenAssignOrScan={() => {
                    setAssignTargetAsset(null);
                    setIsAssignAssetOpen(true);
                  }}
                  onOpenProvisionModal={() => setIsProvisionUserOpen(true)}
                  onAssignTicketToMe={(ticketId) =>
                    handleUpdateTicket(ticketId, {
                      assignToMe: true,
                      nextStatus: 'In Progress',
                    })
                  }
                  onResolveTicketQuick={(ticketId) =>
                    handleUpdateTicket(ticketId, {
                      nextStatus: 'Resolved',
                      replyText: 'Resolved by IT Operations.',
                    })
                  }
                  onConfirmAssetReturnedQuick={handleConfirmExitAssetReturn}
                />
              ) : null}

              {activeHomeTab === 'assets' ? (
                <ItAdminAssetsTab
                  assets={portalState.assets}
                  isDark={isDark}
                  onOpenAddAsset={() => {
                    setEditingAsset(null);
                    setIsAddEditAssetOpen(true);
                  }}
                  onOpenEditAsset={(asset) => {
                    setEditingAsset(asset);
                    setIsAddEditAssetOpen(true);
                  }}
                  onOpenAssignAsset={(asset) => {
                    setAssignTargetAsset(asset);
                    setIsAssignAssetOpen(true);
                  }}
                  onReturnAsset={handleReturnAsset}
                  onOpenRepairModal={(asset) => setRepairAsset(asset)}
                  onOpenQrModal={(asset, mode) =>
                    setQrModalConfig({ open: true, mode, asset })
                  }
                />
              ) : null}

              {activeHomeTab === 'helpdesk' ? (
                <ItAdminTicketsTab
                  tickets={portalState.tickets}
                  itAdminId={portalState.profile.itAdminId}
                  itAdminName={portalState.profile.fullName}
                  isDark={isDark}
                  onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
                  onUpdateTicket={handleUpdateTicket}
                />
              ) : null}

              {activeHomeTab === 'access_security' ? (
                <ItAdminAccessTab
                  users={portalState.users}
                  newJoiners={portalState.newJoiners}
                  securityPolicy={portalState.securityPolicy}
                  isDark={isDark}
                  onOpenProvisionModal={() => setIsProvisionUserOpen(true)}
                  onToggleJoinerStep={handleToggleJoinerStep}
                  onCompleteJoinerSetup={handleCompleteJoinerSetup}
                  onChangeUserRole={handleChangeUserRole}
                  onToggleUserStatus={handleToggleUserStatus}
                  onForcePasswordReset={handleForcePasswordReset}
                  onRevokeUserSessions={handleRevokeUserSessions}
                  onUpdateSecurityPolicy={handleUpdateSecurityPolicy}
                />
              ) : null}
            </div>
          </div>
        ) : null}

        {activeBottomTab === 'assets' ? (
          <div className="px-4 py-3 md:p-0">
            <ItAdminAssetsTab
              assets={portalState.assets}
              isDark={isDark}
              onOpenAddAsset={() => {
                setEditingAsset(null);
                setIsAddEditAssetOpen(true);
              }}
              onOpenEditAsset={(asset) => {
                setEditingAsset(asset);
                setIsAddEditAssetOpen(true);
              }}
              onOpenAssignAsset={(asset) => {
                setAssignTargetAsset(asset);
                setIsAssignAssetOpen(true);
              }}
              onReturnAsset={handleReturnAsset}
              onOpenRepairModal={(asset) => setRepairAsset(asset)}
              onOpenQrModal={(asset, mode) =>
                setQrModalConfig({ open: true, mode, asset })
              }
            />
          </div>
        ) : null}

        {activeBottomTab === 'tickets' ? (
          <div className="px-4 py-3 md:p-0">
            <ItAdminTicketsTab
              tickets={portalState.tickets}
              itAdminId={portalState.profile.itAdminId}
              itAdminName={portalState.profile.fullName}
              isDark={isDark}
              onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
              onUpdateTicket={handleUpdateTicket}
            />
          </div>
        ) : null}

        {activeBottomTab === 'users_rbac' ? (
          <div className="px-4 py-3 md:p-0">
            <ItAdminAccessTab
              users={portalState.users}
              newJoiners={portalState.newJoiners}
              securityPolicy={portalState.securityPolicy}
              isDark={isDark}
              onOpenProvisionModal={() => setIsProvisionUserOpen(true)}
              onToggleJoinerStep={handleToggleJoinerStep}
              onCompleteJoinerSetup={handleCompleteJoinerSetup}
              onChangeUserRole={handleChangeUserRole}
              onToggleUserStatus={handleToggleUserStatus}
              onForcePasswordReset={handleForcePasswordReset}
              onRevokeUserSessions={handleRevokeUserSessions}
              onUpdateSecurityPolicy={handleUpdateSecurityPolicy}
            />
          </div>
        ) : null}

        {activeBottomTab === 'more' ? (
          <div className="px-4 py-3 md:p-0">
            <ItAdminMoreTab
              state={portalState}
              activeModule={activeMoreModule}
              isDark={isDark}
              onSelectModule={setActiveMoreModule}
              onToggleDarkMode={setIsDark}
              onConfirmExitAssetReturn={handleConfirmExitAssetReturn}
              onToggleClearanceAccessStep={handleToggleClearanceAccessStep}
              onSignOffClearance={handleSignOffClearance}
              onTestIntegrationSync={handleTestIntegrationSync}
              onOpenSelfCheckIn={() => setIsSelfCheckInOpen(true)}
              onOpenSelfLeaveModal={() => setIsSelfLeaveOpen(true)}
              onNavigatePersonalPortal={() => router.push('/dashboard/employee')}
              onSaveProfile={handleSaveProfile}
              onLogout={handleLogout}
            />
          </div>
        ) : null}
      </main>

      <LinkedInBottomNav<ItAdminBottomTab>
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
            style={[itSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}
          >
            <View
              style={[
                itSharedStyles.modalSheet,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <View style={itSharedStyles.dragHandleWrap}>
                <View style={[itSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
              </View>
              <Text style={[itSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                Quick IT Actions
              </Text>
              <Text style={[itSharedStyles.metaText, { color: palette.textMuted, marginBottom: 14 }]}>
                Manage assets, QR tags, tickets &amp; user access
              </Text>

              <View style={styles.quickSheetList}>
                <Pressable
                  accessibilityLabel="Quick Action Add Asset"
                  onPress={() => {
                    setIsQuickCreateOpen(false);
                    setEditingAsset(null);
                    setIsAddEditAssetOpen(true);
                  }}
                  style={[
                    styles.quickSheetItem,
                    { backgroundColor: palette.inputBg, borderColor: palette.border },
                  ]}
                >
                  <Laptop size={18} color={palette.primary} strokeWidth={2.2} />
                  <Text style={[itSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    Add Asset
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityLabel="Quick Action Assign Asset"
                  onPress={() => {
                    setIsQuickCreateOpen(false);
                    setAssignTargetAsset(null);
                    setIsAssignAssetOpen(true);
                  }}
                  style={[
                    styles.quickSheetItem,
                    { backgroundColor: palette.inputBg, borderColor: palette.border },
                  ]}
                >
                  <Users size={18} color={palette.sky} strokeWidth={2.2} />
                  <Text style={[itSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    Assign Asset
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityLabel="Quick Action Scan QR"
                  onPress={() => {
                    setIsQuickCreateOpen(false);
                    setQrModalConfig({ open: true, mode: 'scan', asset: null });
                  }}
                  style={[
                    styles.quickSheetItem,
                    { backgroundColor: palette.inputBg, borderColor: palette.border },
                  ]}
                >
                  <QrCode size={18} color={palette.violet} strokeWidth={2.2} />
                  <Text style={[itSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    Scan QR
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityLabel="Quick Action Create Ticket"
                  onPress={() => {
                    setIsQuickCreateOpen(false);
                    setIsCreateTicketOpen(true);
                  }}
                  style={[
                    styles.quickSheetItem,
                    { backgroundColor: palette.inputBg, borderColor: palette.border },
                  ]}
                >
                  <LifeBuoy size={18} color={palette.amber} strokeWidth={2.2} />
                  <Text style={[itSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    Create Ticket
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityLabel="Quick Action Provision User"
                  onPress={() => {
                    setIsQuickCreateOpen(false);
                    setIsProvisionUserOpen(true);
                  }}
                  style={[
                    styles.quickSheetItem,
                    { backgroundColor: palette.inputBg, borderColor: palette.border },
                  ]}
                >
                  <UserPlus size={18} color={palette.emerald} strokeWidth={2.2} />
                  <Text style={[itSharedStyles.subTitle, { color: palette.textPrimary }]}>
                    Provision User
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
            style={[itSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}
          >
            <View
              style={[
                itSharedStyles.modalSheet,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <View style={itSharedStyles.dragHandleWrap}>
                <View style={[itSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
              </View>
              <View style={itSharedStyles.modalHeaderRow}>
                <Text style={[itSharedStyles.modalTitle, { color: palette.textPrimary }]}>
                  Notifications ({portalState.notifications.length})
                </Text>
                {unreadNotificationsCount > 0 ? (
                  <Pressable
                    accessibilityLabel="Mark all notifications read"
                    onPress={handleMarkNotificationsRead}
                  >
                    <Text style={[itSharedStyles.linkText, { color: palette.primary }]}>
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
                      <Text style={[itSharedStyles.subTitle, { color: palette.textPrimary }]}>
                        {n.title}
                      </Text>
                      <Text style={[itSharedStyles.metaText, { color: palette.textSecondary }]}>
                        {n.message}
                      </Text>
                      <Text
                        style={[
                          itSharedStyles.metaText,
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

        {/* Functional IT Admin Modals */}
        <AddEditAssetModal
          visible={isAddEditAssetOpen}
          editingAsset={editingAsset}
          isDark={isDark}
          onClose={() => {
            setIsAddEditAssetOpen(false);
            setEditingAsset(null);
          }}
          onSaveAsset={handleSaveAsset}
        />

        <AssignAssetModal
          visible={isAssignAssetOpen}
          assets={portalState.assets}
          targetAsset={assignTargetAsset}
          users={portalState.users}
          isDark={isDark}
          onClose={() => {
            setIsAssignAssetOpen(false);
            setAssignTargetAsset(null);
          }}
          onConfirmAssign={handleConfirmAssignAsset}
        />

        <QrGeneratorScannerModal
          visible={qrModalConfig.open}
          initialMode={qrModalConfig.mode}
          initialAsset={qrModalConfig.asset}
          assets={portalState.assets}
          isDark={isDark}
          onClose={() => setQrModalConfig({ open: false, mode: 'sticker', asset: null })}
          onQuickStatusToggle={handleQuickQrStatusToggle}
          onPrintConfirmed={(tag) => showToast(`Sent ${tag} QR sticker to label printer`)}
        />

        <LogRepairModal
          visible={Boolean(repairAsset)}
          asset={repairAsset}
          isDark={isDark}
          onClose={() => setRepairAsset(null)}
          onSubmitRepair={handleSubmitRepair}
        />

        <CreateItTicketModal
          visible={isCreateTicketOpen}
          users={portalState.users}
          isDark={isDark}
          onClose={() => setIsCreateTicketOpen(false)}
          onCreateTicket={handleCreateTicket}
        />

        <ProvisionUserModal
          visible={isProvisionUserOpen}
          isDark={isDark}
          onClose={() => setIsProvisionUserOpen(false)}
          onProvisionUser={handleProvisionUser}
        />

        <ItSelfCheckInModal
          visible={isSelfCheckInOpen}
          isDark={isDark}
          profile={portalState.profile}
          selfService={portalState.selfService}
          onClose={() => setIsSelfCheckInOpen(false)}
          onSubmitPunch={handleSelfPunch}
        />

        <ItSelfApplyLeaveModal
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
    gap: 2,
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
    paddingHorizontal: 5,
  },
  segmentButtonText: {
    fontFamily: FONT_SANS,
    fontSize: 10,
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
