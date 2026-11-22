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
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  FileText,
  Home,
  LayoutGrid,
  LifeBuoy,
  Receipt,
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
  AnnouncementItem,
  HolidayItem,
  HrDashboardDataState,
} from '@/lib/hr-dashboard-logic';
import {
  EmployeeBottomTab,
  EmployeeExitReasonCategory,
  EmployeeHomeSubTab,
  EmployeeMoreModuleId,
  EmployeePayrollDocsTab as PayrollSubTab,
  EmployeePortalState,
  aggregateEmployeeRequests,
  createInitialEmployeePortalState,
  getDefaultAnnouncementsForEmployee,
  getSeedHolidays2026,
  loadEmployeePortalState,
  saveEmployeePortalState,
} from '@/lib/employee-portal-logic';
import { enforceEmployeeScope } from '@/lib/route-guards';
import { localMockFetch } from '@/src/services/local-mock-engine';
import { FONT_MONO, FONT_SANS, getPalette } from '../../theme/colors';
import { EmployeeOverviewTab } from './EmployeeOverviewTab';
import {
  EmployeeHolidaysView,
  EmployeeRosterView,
  EmployeeShiftView,
} from './EmployeeShiftsRosterHolidays';
import { EmployeeAttendanceTab } from './EmployeeAttendanceTab';
import { EmployeeLeavesTab } from './EmployeeLeavesTab';
import { EmployeePayrollDocsTab } from './EmployeePayrollDocsTab';
import { EmployeeMoreTab } from './EmployeeMoreTab';
import {
  ApplyLeaveModal,
  ClaimExpenseModal,
  FaceCheckInModal,
  RaiseTicketModal,
  RequestsCenterModal,
} from './EmployeeModals';
import { empSharedStyles } from './EmployeeSharedStyles';

interface EmployeePortalRootProps {
  onLogout?: () => void;
}

const HOME_SUB_TABS: {
  id: EmployeeHomeSubTab;
  label: string;
}[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'my_shift', label: 'My Shift' },
  { id: 'roster', label: 'Roster' },
  { id: 'holidays', label: 'Holidays' },
];

const BOTTOM_TABS: {
  id: EmployeeBottomTab;
  label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'attendance', label: 'Attendance', Icon: CalendarCheck },
  { id: 'leaves', label: 'Leaves', Icon: CalendarPlus },
  { id: 'payroll_docs', label: 'Payroll', Icon: FileText },
  { id: 'more', label: 'More', Icon: LayoutGrid },
];

function readSessionEmployeeIdentity(): {
  employeeId: string;
  fullName: string;
  email: string;
} {
  const cached = authClient.getCachedUser();
  if (cached && cached.role === 'employee') {
    return {
      employeeId: cached.id === 'usr-demo-001' ? 'EMP-2048' : cached.id.toUpperCase(),
      fullName: cached.full_name || 'Rohan Kulkarni',
      email: cached.email || 'rohan.kulkarni@ofc360.com',
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
        if (parsed && parsed.role === 'employee') {
          return {
            employeeId:
              !parsed.id || parsed.id === 'usr-demo-001'
                ? 'EMP-2048'
                : parsed.id.toUpperCase(),
            fullName: parsed.full_name || 'Rohan Kulkarni',
            email: parsed.email || 'rohan.kulkarni@ofc360.com',
          };
        }
      }
    } catch {
      // Fallback to default demo employee
    }
  }
  return {
    employeeId: 'EMP-2048',
    fullName: 'Rohan Kulkarni',
    email: 'rohan.kulkarni@ofc360.com',
  };
}

function readSharedHrSyncData(): {
  holidays: HolidayItem[];
  announcements: AnnouncementItem[];
} {
  const defaultHolidays = getSeedHolidays2026();
  const defaultAnnouncements = getDefaultAnnouncementsForEmployee();
  if (typeof window === 'undefined' || !window.localStorage) {
    return { holidays: defaultHolidays, announcements: defaultAnnouncements };
  }
  try {
    const raw = window.localStorage.getItem('ofc360_local_hr_dashboard_v1');
    if (!raw) {
      return { holidays: defaultHolidays, announcements: defaultAnnouncements };
    }
    const parsed = JSON.parse(raw) as Partial<HrDashboardDataState>;
    const hrHolidays =
      Array.isArray(parsed.holidays) && parsed.holidays.length > 0
        ? parsed.holidays
        : defaultHolidays;
    const hrAnnouncements = Array.isArray(parsed.announcements)
      ? parsed.announcements.filter((a) => a.status !== 'Draft')
      : [];

    const combinedAnnouncements = [...hrAnnouncements, ...defaultAnnouncements].filter(
      (item, index, arr) => arr.findIndex((x) => x.id === item.id) === index
    );

    return {
      holidays: hrHolidays,
      announcements: combinedAnnouncements,
    };
  } catch {
    return { holidays: defaultHolidays, announcements: defaultAnnouncements };
  }
}

const SSR_DEFAULT_IDENTITY = {
  employeeId: 'EMP-2048',
  fullName: 'Rohan Kulkarni',
  email: 'rohan.kulkarni@ofc360.com',
};

const SSR_FALLBACK_PORTAL_STATE = createInitialEmployeePortalState(SSR_DEFAULT_IDENTITY);
const SSR_FALLBACK_HR_SYNC = {
  holidays: getSeedHolidays2026(),
  announcements: getDefaultAnnouncementsForEmployee(),
};

const portalStoreListeners = new Set<() => void>();
let portalSnapshotCacheKey = '';
let portalSnapshotCacheValue: EmployeePortalState = SSR_FALLBACK_PORTAL_STATE;

const hrSyncListeners = new Set<() => void>();
let hrSyncCacheRaw = '__init__';
let hrSyncCacheValue: {
  holidays: HolidayItem[];
  announcements: AnnouncementItem[];
} = SSR_FALLBACK_HR_SYNC;

function subscribePortalStore(listener: () => void): () => void {
  portalStoreListeners.add(listener);
  const handleStorage = (ev: StorageEvent) => {
    if (!ev.key || ev.key.startsWith('ofc360_employee_portal_state_v1_') || ev.key === 'ofc360_local_auth_user_v1') {
      portalSnapshotCacheKey = '';
      listener();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }
  return () => {
    portalStoreListeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

function getClientPortalSnapshot(): EmployeePortalState {
  const sessionId = readSessionEmployeeIdentity();
  const storageKey = `ofc360_employee_portal_state_v1_${sessionId.employeeId}`;
  const raw =
    typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem(storageKey) || ''
      : '';
  const compositeKey = `${sessionId.employeeId}::${sessionId.fullName}::${raw}`;
  if (portalSnapshotCacheKey === compositeKey) {
    return portalSnapshotCacheValue;
  }
  const loaded = loadEmployeePortalState(sessionId);
  portalSnapshotCacheKey = compositeKey;
  portalSnapshotCacheValue = loaded;
  return loaded;
}

function getServerPortalSnapshot(): EmployeePortalState {
  return SSR_FALLBACK_PORTAL_STATE;
}

function mutateClientPortalState(
  updater: (prev: EmployeePortalState) => EmployeePortalState
): void {
  const current = getClientPortalSnapshot();
  const next = updater(current);
  saveEmployeePortalState(next);
  const storageKey = `ofc360_employee_portal_state_v1_${next.profile.employeeId}`;
  const raw =
    typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem(storageKey) || ''
      : '';
  portalSnapshotCacheKey = `${next.profile.employeeId}::${next.profile.fullName}::${raw}`;
  portalSnapshotCacheValue = next;
  portalStoreListeners.forEach((listener) => listener());
}

function subscribeHrSyncStore(listener: () => void): () => void {
  hrSyncListeners.add(listener);
  const handleStorage = (ev: StorageEvent) => {
    if (!ev.key || ev.key === 'ofc360_local_hr_dashboard_v1') {
      hrSyncCacheRaw = '__stale__';
      listener();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }
  return () => {
    hrSyncListeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

function getClientHrSyncSnapshot(): {
  holidays: HolidayItem[];
  announcements: AnnouncementItem[];
} {
  const raw =
    typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem('ofc360_local_hr_dashboard_v1') || ''
      : '';
  if (hrSyncCacheRaw === raw) {
    return hrSyncCacheValue;
  }
  const next = readSharedHrSyncData();
  hrSyncCacheRaw = raw;
  hrSyncCacheValue = next;
  return next;
}

function getServerHrSyncSnapshot(): {
  holidays: HolidayItem[];
  announcements: AnnouncementItem[];
} {
  return SSR_FALLBACK_HR_SYNC;
}

export function EmployeePortalRoot({ onLogout }: EmployeePortalRootProps) {
  const router = useRouter();
  const portalState = useSyncExternalStore(
    subscribePortalStore,
    getClientPortalSnapshot,
    getServerPortalSnapshot
  );
  const sharedHrData = useSyncExternalStore(
    subscribeHrSyncStore,
    getClientHrSyncSnapshot,
    getServerHrSyncSnapshot
  );

  const [isDark, setIsDark] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<EmployeeBottomTab>('home');
  const [activeHomeTab, setActiveHomeTab] = useState<EmployeeHomeSubTab>('overview');
  const [payrollSubTab, setPayrollSubTab] = useState<PayrollSubTab>('payslips');
  const [activeMoreModule, setActiveMoreModule] = useState<EmployeeMoreModuleId | null>(null);

  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isRequestsCenterOpen, setIsRequestsCenterOpen] = useState(false);
  const [toastText, setToastText] = useState<string | null>(null);

  const palette = getPalette(isDark);

  const showToast = useCallback((msg: string) => {
    setToastText(msg);
  }, []);

  useEffect(() => {
    if (!toastText) return;
    const timer = setTimeout(() => setToastText(null), 3200);
    return () => clearTimeout(timer);
  }, [toastText]);

  // Enforce strict employeeId scope on URL params, sync document title, and handle initial ?tab= deep link
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'OFC360 – Employee Self-Service Portal';
    }
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const urlEmpId = params.get('employeeId');
    const sessionId = readSessionEmployeeIdentity();
    const scopeCheck = enforceEmployeeScope(urlEmpId, sessionId.employeeId);
    if (scopeCheck.tampered) {
      params.delete('employeeId');
      const cleaned = params.toString();
      const nextUrl = cleaned
        ? `${window.location.pathname}?${cleaned}`
        : window.location.pathname;
      window.history.replaceState(null, '', nextUrl);
    }
    const tabParam = params.get('tab');
    if (
      tabParam === 'attendance' ||
      tabParam === 'leaves' ||
      tabParam === 'payroll' ||
      tabParam === 'more'
    ) {
      const t = setTimeout(() => {
        if (tabParam === 'attendance') setActiveBottomTab('attendance');
        if (tabParam === 'leaves') setActiveBottomTab('leaves');
        if (tabParam === 'payroll') setActiveBottomTab('payroll_docs');
        if (tabParam === 'more') setActiveBottomTab('more');
      }, 0);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, [isDark]);

  const updatePortalState = useCallback(
    (updater: (prev: EmployeePortalState) => EmployeePortalState) => {
      mutateClientPortalState(updater);
    },
    []
  );

  const unreadNotificationsCount = useMemo(
    () => portalState.notifications.filter((n) => !n.read).length,
    [portalState.notifications]
  );

  const aggregatedRequests = useMemo(
    () => aggregateEmployeeRequests(portalState),
    [portalState]
  );

  const holidayDates = useMemo(
    () => sharedHrData.holidays.map((h) => h.date),
    [sharedHrData.holidays]
  );

  // Handlers
  const handleSelectBottomTab = (tab: EmployeeBottomTab) => {
    setActiveBottomTab(tab);
    if (tab !== 'more') {
      setActiveMoreModule(null);
    }
  };

  const handleFacePunch = async (payload: {
    action: 'Check-In' | 'Check-Out';
    workMode: 'Office' | 'WFH' | 'On-Duty';
    locationLabel: string;
    selfieCaptured: boolean;
    confidenceScore: number;
  }) => {
    const now = new Date();
    const nowIso = now.toISOString();
    const todayIso = nowIso.slice(0, 10);
    const timeLabel = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    updatePortalState((prev) => {
      if (payload.action === 'Check-In') {
        return {
          ...prev,
          todaySession: {
            dateIso: todayIso,
            status: 'Checked In',
            checkInTime: timeLabel,
            checkInIso: nowIso,
            checkOutTime: null,
            checkOutIso: null,
            workMode: payload.workMode,
            locationLabel: payload.locationLabel,
            geofenceVerified: true,
            confidenceScore: payload.confidenceScore,
          },
          notifications: [
            {
              id: `ENOT-${Date.now()}`,
              title: 'Attendance Checked In',
              message: `Biometric ${payload.workMode} check-in verified at ${timeLabel}.`,
              timestamp: 'Just now',
              category: 'Attendance',
              read: false,
            },
            ...prev.notifications,
          ],
        };
      }

      // Check-Out updates todaySession and appends completed record
      const updatedRecord = {
        id: `ATT-${Date.now().toString().slice(-4)}`,
        dateIso: todayIso,
        displayDate: now.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
        dayName: now.toLocaleDateString('en-US', { weekday: 'short' }),
        status: 'Present' as const,
        checkIn: prev.todaySession.checkInTime || timeLabel,
        checkOut: timeLabel,
        totalHours: '08h 45m',
        workMode: payload.workMode,
        location: payload.locationLabel,
      };

      return {
        ...prev,
        todaySession: {
          ...prev.todaySession,
          status: 'Checked Out',
          checkOutTime: timeLabel,
          checkOutIso: nowIso,
          workMode: payload.workMode,
          locationLabel: payload.locationLabel,
        },
        attendanceRecords: [
          updatedRecord,
          ...prev.attendanceRecords.filter((r) => r.dateIso !== todayIso),
        ],
      };
    });

    // Sync with HR Admin shared face logs
    try {
      await localMockFetch('/api/v1/hr/attendance/face-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: portalState.profile.employeeId,
          employeeName: portalState.profile.fullName,
          department: portalState.profile.department,
          shift: portalState.shiftAssignment.shiftName,
          punchType: payload.action,
          location: payload.locationLabel,
        }),
      });
    } catch {
      // Local state already persisted
    }

    showToast(`Face ${payload.action} verified at ${timeLabel}`);
  };

  const handleApplyLeave = async (payload: {
    leaveKey: 'earned' | 'casual' | 'sick' | 'unpaid';
    leaveType: string;
    fromDate: string;
    toDate: string;
    isHalfDay: boolean;
    days: number;
    reason: string;
    attachmentName?: string;
  }) => {
    const newId = `LEV-${Math.floor(400 + Math.random() * 599)}`;
    updatePortalState((prev) => ({
      ...prev,
      leaveBalances: prev.leaveBalances.map((b) =>
        b.key === payload.leaveKey
          ? {
              ...b,
              used: b.used + payload.days,
              remaining: b.key === 'unpaid' ? 0 : Math.max(0, b.remaining - payload.days),
            }
          : b
      ),
      leaveRequests: [
        {
          id: newId,
          employeeId: prev.profile.employeeId,
          leaveKey: payload.leaveKey,
          leaveType: payload.leaveType,
          fromDate: payload.fromDate,
          toDate: payload.toDate,
          isHalfDay: payload.isHalfDay,
          days: payload.days,
          reason: payload.reason,
          attachmentName: payload.attachmentName,
          status: 'Pending',
          appliedAt: 'Just now',
        },
        ...prev.leaveRequests,
      ],
    }));

    try {
      await localMockFetch('/api/v1/hr/approvals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: portalState.profile.employeeId,
          employeeName: portalState.profile.fullName,
          department: portalState.profile.department,
          category: 'Leave Requests',
          requestType: payload.leaveType,
          requestDate: `${payload.fromDate} – ${payload.toDate}`,
          durationOrAmount: `${payload.days} Days`,
          reason: payload.reason,
        }),
      });
    } catch {
      // Local state already updated
    }

    showToast(`${payload.leaveType} request (${payload.days}d) submitted`);
  };

  const handleCancelLeave = (leaveId: string) => {
    updatePortalState((prev) => {
      const target = prev.leaveRequests.find((l) => l.id === leaveId);
      if (!target || target.status !== 'Pending') return prev;
      return {
        ...prev,
        leaveBalances: prev.leaveBalances.map((b) =>
          b.key === target.leaveKey
            ? {
                ...b,
                used: Math.max(0, b.used - target.days),
                remaining:
                  b.key === 'unpaid'
                    ? 0
                    : Math.min(b.total, b.remaining + target.days),
              }
            : b
        ),
        leaveRequests: prev.leaveRequests.map((l) =>
          l.id === leaveId ? { ...l, status: 'Cancelled' } : l
        ),
      };
    });
    showToast('Pending leave request cancelled & balance restored');
  };

  const handleSubmitShiftChange = (payload: {
    requestedShift: string;
    effectiveDate: string;
    reason: string;
  }) => {
    updatePortalState((prev) => ({
      ...prev,
      shiftChangeRequests: [
        {
          id: `SCR-${Math.floor(200 + Math.random() * 799)}`,
          employeeId: prev.profile.employeeId,
          currentShift: `${prev.shiftAssignment.shiftName} (${prev.shiftAssignment.shiftCode})`,
          requestedShift: payload.requestedShift,
          effectiveDate: payload.effectiveDate,
          reason: payload.reason,
          status: 'Pending',
          submittedAt: 'Just now',
        },
        ...prev.shiftChangeRequests,
      ],
    }));
    showToast('Shift change request submitted');
  };

  const handleToggleOptionalHoliday = (holidayId: string) => {
    updatePortalState((prev) => {
      const nextSelected = !prev.optionalHolidaySelections[holidayId];
      showToast(
        nextSelected
          ? 'Optional floating holiday opted in'
          : 'Optional holiday selection removed'
      );
      return {
        ...prev,
        optionalHolidaySelections: {
          ...prev.optionalHolidaySelections,
          [holidayId]: nextSelected,
        },
      };
    });
  };

  const handleAcknowledgeLetter = (letterId: string) => {
    updatePortalState((prev) => ({
      ...prev,
      hrLetters: prev.hrLetters.map((l) =>
        l.id === letterId
          ? { ...l, acknowledged: true, acknowledgedAt: 'Today · Signed Digitally' }
          : l
      ),
    }));
    showToast('Policy digitally signed and acknowledged');
  };

  const handleUploadKycDoc = (payload: {
    docType: 'Aadhaar Card' | 'PAN Card' | 'Passport' | 'Education Certificate';
    documentNumberMasked: string;
    fileName: string;
  }) => {
    updatePortalState((prev) => {
      const exists = prev.kycDocuments.some((d) => d.docType === payload.docType);
      const updatedDocs = exists
        ? prev.kycDocuments.map((d) =>
            d.docType === payload.docType
              ? {
                  ...d,
                  documentNumberMasked: payload.documentNumberMasked,
                  fileName: payload.fileName,
                  uploadedAt: 'Just now',
                  status: 'Pending' as const,
                  reviewerNote: 'Submitted for HR document verification.',
                }
              : d
          )
        : [
            {
              id: `KYC-${Date.now().toString().slice(-3)}`,
              docType: payload.docType,
              documentNumberMasked: payload.documentNumberMasked,
              fileName: payload.fileName,
              uploadedAt: 'Just now',
              status: 'Pending' as const,
              reviewerNote: 'Submitted for HR document verification.',
            },
            ...prev.kycDocuments,
          ];
      return {
        ...prev,
        kycDocuments: updatedDocs,
      };
    });
    showToast(`${payload.docType} uploaded for verification`);
  };

  const handleReportAssetIssue = (assetId: string, issueNote: string) => {
    updatePortalState((prev) => ({
      ...prev,
      assignedAssets: prev.assignedAssets.map((a) =>
        a.id === assetId
          ? { ...a, condition: 'Issue Reported', issueNote }
          : a
      ),
    }));
    showToast('Hardware issue reported to IT Asset Desk');
  };

  const handleClaimExpense = async (payload: {
    title: string;
    category: 'Travel' | 'Meals' | 'Internet & Phone' | 'Client Hosting' | 'Equipment';
    expenseDate: string;
    amount: number;
    receiptName?: string;
    notes: string;
  }) => {
    updatePortalState((prev) => ({
      ...prev,
      expenseClaims: [
        {
          id: `EXP-${Math.floor(500 + Math.random() * 499)}`,
          employeeId: prev.profile.employeeId,
          ...payload,
          status: 'Pending',
          submittedAt: 'Just now',
        },
        ...prev.expenseClaims,
      ],
    }));

    try {
      await localMockFetch('/api/v1/hr/approvals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: portalState.profile.employeeId,
          employeeName: portalState.profile.fullName,
          department: portalState.profile.department,
          category: 'Expense Claims',
          requestType: payload.title,
          requestDate: payload.expenseDate,
          durationOrAmount: `₹${payload.amount.toLocaleString('en-IN')}`,
          reason: payload.notes,
        }),
      });
    } catch {
      // Local state already updated
    }

    showToast(`Expense claim ₹${payload.amount.toLocaleString('en-IN')} submitted`);
  };

  const handleSubmitTravel = (payload: {
    destination: string;
    purpose: string;
    departureDate: string;
    returnDate: string;
    mode: 'Flight' | 'Train' | 'Cab & Hotel';
    estimatedBudget: number;
  }) => {
    updatePortalState((prev) => ({
      ...prev,
      travelRequests: [
        {
          id: `TRV-${Math.floor(800 + Math.random() * 199)}`,
          employeeId: prev.profile.employeeId,
          ...payload,
          itinerarySummary: `${payload.mode} booking pending desk confirmation`,
          status: 'Pending',
          submittedAt: 'Just now',
        },
        ...prev.travelRequests,
      ],
    }));
    showToast(`Travel request to ${payload.destination} submitted`);
  };

  const handleRaiseTicket = async (payload: {
    category: 'HR & Payroll' | 'IT & Hardware' | 'Facilities' | 'Policy & Benefits';
    priority: 'High' | 'Medium' | 'Low';
    subject: string;
    description: string;
  }) => {
    const num = Math.floor(900 + Math.random() * 99);
    updatePortalState((prev) => ({
      ...prev,
      helpdeskTickets: [
        {
          id: `TKT-${num}`,
          ticketNumber: `HD-2026-${num}`,
          employeeId: prev.profile.employeeId,
          category: payload.category,
          priority: payload.priority,
          subject: payload.subject,
          description: payload.description,
          status: 'Pending',
          createdAt: 'Just now',
          replies: [
            {
              id: `REP-${Date.now()}`,
              sender: 'Employee',
              senderName: prev.profile.fullName,
              message: payload.description,
              timestamp: 'Just now',
            },
          ],
        },
        ...prev.helpdeskTickets,
      ],
    }));

    try {
      await localMockFetch('/api/v1/hr/helpdesk/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: portalState.profile.employeeId,
          employeeName: portalState.profile.fullName,
          department: portalState.profile.department,
          subject: payload.subject,
          description: payload.description,
          category: payload.category,
          priority: payload.priority,
        }),
      });
    } catch {
      // Local state already updated
    }

    showToast(`Helpdesk ticket HD-2026-${num} created`);
  };

  const handleReplyTicket = (ticketId: string, message: string) => {
    updatePortalState((prev) => ({
      ...prev,
      helpdeskTickets: prev.helpdeskTickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              replies: [
                ...t.replies,
                {
                  id: `REP-${Date.now()}`,
                  sender: 'Employee',
                  senderName: prev.profile.fullName,
                  message,
                  timestamp: 'Just now',
                },
              ],
            }
          : t
      ),
    }));
    showToast('Reply sent to support queue');
  };

  const handleSendChatMessage = (threadId: string, text: string) => {
    updatePortalState((prev) => ({
      ...prev,
      chatThreads: prev.chatThreads.map((th) =>
        th.id === threadId
          ? {
              ...th,
              messages: [
                ...th.messages,
                {
                  id: `MSG-${Date.now()}`,
                  sender: 'me',
                  text,
                  time: 'Just now',
                },
              ],
            }
          : th
      ),
    }));
  };

  const handleToggleOnboardingTask = (taskId: string) => {
    updatePortalState((prev) => ({
      ...prev,
      onboardingTasks: prev.onboardingTasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ),
    }));
    showToast('Onboarding checklist updated');
  };

  const handleSubmitResignation = async (payload: {
    reasonCategory: EmployeeExitReasonCategory;
    requestedLastWorkingDay: string;
    handoverTo: string;
    notes: string;
  }) => {
    const submittedDate = new Date().toISOString().slice(0, 10);
    updatePortalState((prev) => ({
      ...prev,
      exitManagement: {
        ...prev.exitManagement,
        status: 'Resignation Submitted',
        submittedDate,
        requestedLastWorkingDay: payload.requestedLastWorkingDay,
        reasonCategory: payload.reasonCategory,
        handoverTo: payload.handoverTo,
        notes: payload.notes,
        withdrawalReason: undefined,
      },
      notifications: [
        {
          id: `ENOT-${Date.now()}`,
          title: 'Resignation Request Submitted',
          message: `Requested LWD ${payload.requestedLastWorkingDay} routed to ${prev.profile.reportingManager} & People Ops.`,
          timestamp: 'Just now',
          category: 'Approval',
          read: false,
        },
        ...prev.notifications,
      ],
    }));

    try {
      await localMockFetch('/api/v1/hr/approvals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: portalState.profile.employeeId,
          employeeName: portalState.profile.fullName,
          department: portalState.profile.department,
          category: 'Exit & Offboarding',
          requestType: `Resignation (${payload.reasonCategory})`,
          requestDate: payload.requestedLastWorkingDay,
          durationOrAmount: `${portalState.exitManagement.noticePeriodDays}d Notice`,
          reason: payload.notes,
        }),
      });
    } catch {
      // Local state already persisted
    }

    showToast('Resignation submitted for HR & Manager review');
  };

  const handleWithdrawResignation = (withdrawalReason: string) => {
    updatePortalState((prev) => ({
      ...prev,
      exitManagement: {
        ...prev.exitManagement,
        status: 'Withdrawn',
        withdrawalReason,
      },
      notifications: [
        {
          id: `ENOT-${Date.now()}`,
          title: 'Resignation Withdrawn',
          message: 'Your resignation request has been withdrawn and employment remains active.',
          timestamp: 'Just now',
          category: 'Approval',
          read: false,
        },
        ...prev.notifications,
      ],
    }));
    showToast('Resignation request withdrawn');
  };

  const handleToggleClearanceTask = (taskId: string) => {
    updatePortalState((prev) => ({
      ...prev,
      exitManagement: {
        ...prev.exitManagement,
        clearanceTasks: prev.exitManagement.clearanceTasks.map((t) =>
          t.id === taskId && t.employeeActionable
            ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' }
            : t
        ),
      },
    }));
    showToast('Exit clearance checklist updated');
  };

  const handleSubmitExitInterview = (rating: number, feedback: string) => {
    updatePortalState((prev) => ({
      ...prev,
      exitManagement: {
        ...prev.exitManagement,
        exitInterviewSubmitted: true,
        exitInterviewRating: rating,
        exitInterviewFeedback: feedback,
      },
    }));
    showToast('Confidential exit interview saved');
  };

  const handleSaveProfile = (patch: Partial<EmployeePortalState['profile']>) => {
    updatePortalState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...patch,
      },
    }));
    showToast('Profile & contact details saved');
  };

  const handleMarkNotificationsRead = () => {
    updatePortalState((prev) => ({
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
      {
        id: 'emp-q-checkin',
        title: 'Face Check-In / Check-Out',
        subtitle: 'Log biometric attendance punch',
        group: 'Action',
        onSelect: () => setIsFaceModalOpen(true),
      },
      {
        id: 'emp-q-leave',
        title: 'Apply for Leave',
        subtitle: 'Submit a new leave request',
        group: 'Action',
        onSelect: () => setIsLeaveModalOpen(true),
      },
      {
        id: 'emp-q-expense',
        title: 'Claim Expense',
        subtitle: 'Submit reimbursement claim',
        group: 'Action',
        onSelect: () => setIsExpenseModalOpen(true),
      },
      {
        id: 'emp-q-ticket',
        title: 'Raise Helpdesk Ticket',
        subtitle: 'Contact IT or HR support',
        group: 'Action',
        onSelect: () => setIsTicketModalOpen(true),
      },
      ...sharedHrData.holidays.slice(0, 6).map((h) => ({
        id: `emp-hol-${h.id}`,
        title: h.name,
        subtitle: `${h.displayDate} · ${h.category}`,
        group: 'Holiday',
        onSelect: () => {
          setActiveBottomTab('home');
          setActiveHomeTab('holidays');
        },
      })),
    ],
    [sharedHrData.holidays]
  );

  const messageItems = useMemo<MessagePreviewItem[]>(
    () =>
      sharedHrData.announcements.map((a) => ({
        id: a.id,
        title: a.title,
        body: a.description,
        meta: `${a.category} · ${a.publishedDate}`,
      })),
    [sharedHrData.announcements]
  );

  return (
    <div
      data-testid="ofc360-employee-portal"
      className="min-h-dvh w-full bg-[#F3F2EF] text-[#171717] flex flex-col"
    >
      <LinkedInHeader<EmployeeBottomTab>
        userName={portalState.profile.fullName}
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={messageItems.length}
        navItems={BOTTOM_TABS}
        activeNavId={activeBottomTab}
        onSelectNav={handleSelectBottomTab}
        onOpenProfile={() => {
          setActiveBottomTab('more');
          setActiveMoreModule('profile');
        }}
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
                ariaLabel="Employee workspace sections"
              />
            </div>

            <div className="px-4 md:px-0">
              {activeHomeTab === 'overview' ? (
                <EmployeeOverviewTab
                  state={portalState}
                  holidaysCount={sharedHrData.holidays.length}
                  announcements={sharedHrData.announcements}
                  isDark={isDark}
                  onSelectHomeTab={setActiveHomeTab}
                  onNavigateBottom={handleSelectBottomTab}
                  onOpenPayrollDocsSubTab={(sub) => {
                    setPayrollSubTab(sub);
                    handleSelectBottomTab('payroll_docs');
                  }}
                  onOpenFaceCheckIn={() => setIsFaceModalOpen(true)}
                  onOpenApplyLeave={() => setIsLeaveModalOpen(true)}
                  onOpenRequestsCenter={() => setIsRequestsCenterOpen(true)}
                />
              ) : null}

              {activeHomeTab === 'my_shift' ? (
                <EmployeeShiftView
                  isDark={isDark}
                  shift={portalState.shiftAssignment}
                  shiftChangeRequests={portalState.shiftChangeRequests}
                  onSubmitShiftChange={handleSubmitShiftChange}
                />
              ) : null}

              {activeHomeTab === 'roster' ? (
                <EmployeeRosterView
                  isDark={isDark}
                  rosterDays={portalState.rosterDays}
                  employeeName={portalState.profile.fullName}
                  employeeId={portalState.profile.employeeId}
                />
              ) : null}

              {activeHomeTab === 'holidays' ? (
                <EmployeeHolidaysView
                  isDark={isDark}
                  holidays={sharedHrData.holidays}
                  optionalSelections={portalState.optionalHolidaySelections}
                  onToggleOptionalHoliday={handleToggleOptionalHoliday}
                />
              ) : null}
            </div>
          </div>
        ) : null}

        {activeBottomTab === 'attendance' ? (
          <div className="px-4 py-3 md:p-0">
            <EmployeeAttendanceTab
              state={portalState}
              isDark={isDark}
              onOpenFaceCheckIn={() => setIsFaceModalOpen(true)}
            />
          </div>
        ) : null}

        {activeBottomTab === 'leaves' ? (
          <div className="px-4 py-3 md:p-0">
            <EmployeeLeavesTab
              state={portalState}
              isDark={isDark}
              onOpenApplyLeave={() => setIsLeaveModalOpen(true)}
              onCancelLeave={handleCancelLeave}
            />
          </div>
        ) : null}

        {activeBottomTab === 'payroll_docs' ? (
          <div className="px-4 py-3 md:p-0">
            <EmployeePayrollDocsTab
              state={portalState}
              activeSubTab={payrollSubTab}
              isDark={isDark}
              onSelectSubTab={setPayrollSubTab}
              onAcknowledgeLetter={handleAcknowledgeLetter}
              onUploadKycDoc={handleUploadKycDoc}
              onSuccessToast={showToast}
            />
          </div>
        ) : null}

        {activeBottomTab === 'more' ? (
          <div className="px-4 py-3 md:p-0">
            <EmployeeMoreTab
              state={portalState}
              announcements={sharedHrData.announcements}
              activeModule={activeMoreModule}
              isDark={isDark}
              onSelectModule={setActiveMoreModule}
              onToggleDarkMode={setIsDark}
              onReportAssetIssue={handleReportAssetIssue}
              onOpenClaimExpense={() => setIsExpenseModalOpen(true)}
              onSubmitTravel={handleSubmitTravel}
              onOpenRaiseTicket={() => setIsTicketModalOpen(true)}
              onReplyTicket={handleReplyTicket}
              onSendChatMessage={handleSendChatMessage}
              onToggleOnboardingTask={handleToggleOnboardingTask}
              onSubmitResignation={handleSubmitResignation}
              onWithdrawResignation={handleWithdrawResignation}
              onToggleClearanceTask={handleToggleClearanceTask}
              onSubmitExitInterview={handleSubmitExitInterview}
              onSaveProfile={handleSaveProfile}
              onLogout={handleLogout}
            />
          </div>
        ) : null}
      </main>

      <LinkedInBottomNav<EmployeeBottomTab>
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
          style={[empSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}
        >
          <View
            style={[
              empSharedStyles.modalSheet,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={empSharedStyles.dragHandleWrap}>
              <View style={[empSharedStyles.dragHandle, { backgroundColor: palette.handleBar }]} />
            </View>
            <Text style={[empSharedStyles.modalTitle, { color: palette.textPrimary }]}>
              Quick Self-Service Actions
            </Text>
            <Text style={[empSharedStyles.metaText, { color: palette.textMuted, marginBottom: 14 }]}>
              Submit a new employee request in seconds
            </Text>

            <View style={styles.quickSheetList}>
              <Pressable
                accessibilityLabel="Quick Create Apply Leave"
                onPress={() => {
                  setIsQuickCreateOpen(false);
                  setIsLeaveModalOpen(true);
                }}
                style={[
                  styles.quickSheetItem,
                  { backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <CalendarPlus size={18} color={palette.primary} strokeWidth={2.2} />
                <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                  Apply Leave
                </Text>
              </Pressable>

              <Pressable
                accessibilityLabel="Quick Create Claim Expense"
                onPress={() => {
                  setIsQuickCreateOpen(false);
                  setIsExpenseModalOpen(true);
                }}
                style={[
                  styles.quickSheetItem,
                  { backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <Receipt size={18} color={palette.emerald} strokeWidth={2.2} />
                <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                  Claim Expense
                </Text>
              </Pressable>

              <Pressable
                accessibilityLabel="Quick Create Raise Ticket"
                onPress={() => {
                  setIsQuickCreateOpen(false);
                  setIsTicketModalOpen(true);
                }}
                style={[
                  styles.quickSheetItem,
                  { backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <LifeBuoy size={18} color={palette.amber} strokeWidth={2.2} />
                <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                  Raise Ticket
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
          style={[empSharedStyles.modalBackdrop, { backgroundColor: palette.overlay }]}
        >
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
                Notifications ({portalState.notifications.length})
              </Text>
              {unreadNotificationsCount > 0 ? (
                <Pressable
                  accessibilityLabel="Mark all notifications read"
                  onPress={handleMarkNotificationsRead}
                >
                  <Text style={[empSharedStyles.linkText, { color: palette.primary }]}>
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
                    <Text style={[empSharedStyles.subTitle, { color: palette.textPrimary }]}>
                      {n.title}
                    </Text>
                    <Text style={[empSharedStyles.metaText, { color: palette.textSecondary }]}>
                      {n.message}
                    </Text>
                    <Text style={[empSharedStyles.metaText, { color: palette.textMuted, fontSize: 10, marginTop: 2 }]}>
                      {n.category} · {n.timestamp}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Functional Modals */}
      <FaceCheckInModal
        visible={isFaceModalOpen}
        isDark={isDark}
        profile={portalState.profile}
        todaySession={portalState.todaySession}
        onClose={() => setIsFaceModalOpen(false)}
        onSubmitPunch={handleFacePunch}
      />

      <ApplyLeaveModal
        visible={isLeaveModalOpen}
        isDark={isDark}
        balances={portalState.leaveBalances}
        holidayDates={holidayDates}
        onClose={() => setIsLeaveModalOpen(false)}
        onSubmitLeave={handleApplyLeave}
      />

      <ClaimExpenseModal
        visible={isExpenseModalOpen}
        isDark={isDark}
        onClose={() => setIsExpenseModalOpen(false)}
        onSubmitExpense={handleClaimExpense}
      />

      <RaiseTicketModal
        visible={isTicketModalOpen}
        isDark={isDark}
        onClose={() => setIsTicketModalOpen(false)}
        onSubmitTicket={handleRaiseTicket}
      />

      <RequestsCenterModal
        visible={isRequestsCenterOpen}
        isDark={isDark}
        items={aggregatedRequests.items}
        onClose={() => setIsRequestsCenterOpen(false)}
        onCancelLeave={handleCancelLeave}
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
    padding: 4,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    gap: 5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonText: {
    fontFamily: FONT_SANS,
    fontSize: 11,
    fontWeight: '600',
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
