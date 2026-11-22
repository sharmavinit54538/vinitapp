'use client';

import React, { useMemo } from 'react';
import {
  Users,
  Clock,
  ClipboardCheck,
  CalendarDays,
  UserPlus,
  Megaphone,
  ScanFace,
  Wallet,
} from 'lucide-react';
import {
  HrDashboardDataState,
  HomeInternalTab,
  BottomNavTab,
  calculateAttendancePercentages,
} from '@/lib/hr-dashboard-logic';
import {
  useDecideApprovalMutation,
} from '@/lib/store/hr-api';
import {
  formatDynamicOverviewDate,
  formatMetricValue,
  getAuthorizedQuickActions,
  getCurrentYearHolidayLabel,
  resolveDataSectionState,
} from '@/src/lib/linkedin-ui-helpers';
import {
  LinkedInTopTabs,
  LinkedInTopTabItem,
  LinkedInSection,
  LinkedInEmptyState,
  LinkedInLoadingRows,
  LinkedInErrorState,
} from '../components/linkedin/LinkedInPrimitives';
import { ShiftsAndRostersScreen } from './ShiftsAndRostersScreen';
import { HolidayCalendarScreen } from './HolidayCalendarScreen';

interface HomeScreenProps {
  data?: HrDashboardDataState;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  activeHomeTab: HomeInternalTab;
  onSelectHomeTab: (tab: HomeInternalTab) => void;
  onNavigateTab: (tab: BottomNavTab) => void;
  onOpenAddEmployee: () => void;
  onOpenAnnouncement: () => void;
  onOpenPayroll?: () => void;
  isDark: boolean;
  canManage: boolean;
  onSuccessToast: (msg: string) => void;
}

const HOME_TABS: LinkedInTopTabItem<HomeInternalTab>[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'shifts', label: 'Shifts' },
  { id: 'rosters', label: 'Rosters' },
  { id: 'holidays', label: 'Holidays' },
];

export function HomeScreen({
  data,
  isLoading = false,
  isError = false,
  onRetry,
  activeHomeTab,
  onSelectHomeTab,
  onNavigateTab,
  onOpenAddEmployee,
  onOpenAnnouncement,
  onOpenPayroll,
  isDark,
  canManage,
  onSuccessToast,
}: HomeScreenProps) {
  const [decideApproval] = useDecideApprovalMutation();

  const todayFormatted = useMemo(() => formatDynamicOverviewDate(), []);
  const currentYearHolidayLabel = useMemo(() => getCurrentYearHolidayLabel(), []);

  const attendanceStats = data
    ? calculateAttendancePercentages(data.kpis.attendance)
    : null;

  const pendingApprovals = useMemo(
    () => (data ? data.approvals.filter((a) => a.status === 'Pending') : null),
    [data]
  );

  const approvalsSectionState = resolveDataSectionState({
    isLoading,
    isError,
    itemCount: pendingApprovals ? pendingApprovals.length : null,
  });

  const authorizedShortcuts = useMemo(
    () => getAuthorizedQuickActions(canManage),
    [canManage]
  );

  const handleDecision = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await decideApproval({ id, status }).unwrap();
      onSuccessToast(`Request ${status.toLowerCase()}`);
    } catch {
      onSuccessToast('Could not process request');
    }
  };

  const handleShortcutPress = (
    id: 'add_employee' | 'notice' | 'check_in' | 'payroll'
  ) => {
    if (id === 'add_employee') {
      onOpenAddEmployee();
    } else if (id === 'notice') {
      onOpenAnnouncement();
    } else if (id === 'check_in') {
      onNavigateTab('attendance');
    } else if (id === 'payroll') {
      if (onOpenPayroll) {
        onOpenPayroll();
      } else {
        onNavigateTab('more');
      }
    }
  };

  const getShortcutIcon = (
    id: 'add_employee' | 'notice' | 'check_in' | 'payroll'
  ) => {
    switch (id) {
      case 'add_employee':
        return UserPlus;
      case 'notice':
        return Megaphone;
      case 'check_in':
        return ScanFace;
      case 'payroll':
        return Wallet;
    }
  };

  return (
    <div className="w-full space-y-2 md:space-y-4">
      {/* Flat Underlined Top Navigation Tabs (Overview | Shifts | Rosters | Holidays) */}
      <div className="w-full md:rounded-lg md:overflow-hidden md:border md:border-[#E5E7EB]">
        <LinkedInTopTabs
          tabs={HOME_TABS}
          activeTab={activeHomeTab}
          onSelect={onSelectHomeTab}
          ariaLabel="Workforce overview navigation"
        />
      </div>

      {activeHomeTab === 'overview' ? (
        <div className="space-y-2 md:space-y-4">
          {/* 1. Workforce Overview Section (2x2 Thin-Bordered Metric Grid) */}
          <LinkedInSection>
            <div className="flex items-baseline justify-between gap-3 px-4 pt-4 pb-3">
              <h1 className="text-[16px] font-semibold tracking-tight text-[#171717]">
                Workforce overview
              </h1>
              <span className="text-[12px] font-normal text-[#666666] whitespace-nowrap">
                {todayFormatted}
              </span>
            </div>

            <div className="grid grid-cols-2 border-t border-[#E5E7EB]">
              {/* Cell 1: Active workforce */}
              <button
                type="button"
                onClick={() => onNavigateTab('workforce')}
                className="flex flex-col items-start justify-between border-r border-b border-[#E5E7EB] p-4 text-left hover:bg-[#F3F2EF]/60 transition-colors cursor-pointer min-h-[96px]"
              >
                <div className="flex items-center gap-1.5 text-[#666666]">
                  <Users
                    className="h-4 w-4 text-[#404040] shrink-0"
                    strokeWidth={1.75}
                  />
                  <span className="text-[12px] sm:text-[13px] font-normal leading-snug">
                    Active workforce
                  </span>
                </div>
                <span className="mt-2 text-[24px] font-bold leading-none text-[#171717] tabular-nums">
                  {formatMetricValue({
                    value: data ? data.workforce.length : null,
                    isLoading,
                    isError,
                  })}
                </span>
              </button>

              {/* Cell 2: Attendance rate */}
              <button
                type="button"
                onClick={() => onNavigateTab('attendance')}
                className="flex flex-col items-start justify-between border-b border-[#E5E7EB] p-4 text-left hover:bg-[#F3F2EF]/60 transition-colors cursor-pointer min-h-[96px]"
              >
                <div className="flex items-center gap-1.5 text-[#666666]">
                  <Clock
                    className="h-4 w-4 text-[#404040] shrink-0"
                    strokeWidth={1.75}
                  />
                  <span className="text-[12px] sm:text-[13px] font-normal leading-snug">
                    Attendance rate
                  </span>
                </div>
                <span className="mt-2 text-[24px] font-bold leading-none text-[#171717] tabular-nums">
                  {formatMetricValue({
                    value: attendanceStats
                      ? attendanceStats.effectivePresentPct
                      : null,
                    isLoading,
                    isError,
                    suffix: '%',
                  })}
                </span>
              </button>

              {/* Cell 3: Pending approvals */}
              <button
                type="button"
                onClick={() => onNavigateTab('approvals')}
                className="flex flex-col items-start justify-between border-r border-[#E5E7EB] p-4 text-left hover:bg-[#F3F2EF]/60 transition-colors cursor-pointer min-h-[96px]"
              >
                <div className="flex items-center gap-1.5 text-[#666666]">
                  <ClipboardCheck
                    className="h-4 w-4 text-[#404040] shrink-0"
                    strokeWidth={1.75}
                  />
                  <span className="text-[12px] sm:text-[13px] font-normal leading-snug">
                    Pending approvals
                  </span>
                </div>
                <span className="mt-2 text-[24px] font-bold leading-none text-[#171717] tabular-nums">
                  {formatMetricValue({
                    value: pendingApprovals ? pendingApprovals.length : null,
                    isLoading,
                    isError,
                  })}
                </span>
              </button>

              {/* Cell 4: Current-year holidays */}
              <button
                type="button"
                onClick={() => onSelectHomeTab('holidays')}
                className="flex flex-col items-start justify-between p-4 text-left hover:bg-[#F3F2EF]/60 transition-colors cursor-pointer min-h-[96px]"
              >
                <div className="flex items-center gap-1.5 text-[#666666]">
                  <CalendarDays
                    className="h-4 w-4 text-[#404040] shrink-0"
                    strokeWidth={1.75}
                  />
                  <span className="text-[12px] sm:text-[13px] font-normal leading-snug">
                    {currentYearHolidayLabel}
                  </span>
                </div>
                <span className="mt-2 text-[24px] font-bold leading-none text-[#171717] tabular-nums">
                  {formatMetricValue({
                    value: data ? data.holidays.length : null,
                    isLoading,
                    isError,
                  })}
                </span>
              </button>
            </div>
          </LinkedInSection>

          {/* 2. Quick Actions Section (4 Equally Spaced Shortcuts in Single Row) */}
          {authorizedShortcuts.length > 0 ? (
            <LinkedInSection className="px-4 py-4">
              <h2 className="text-[15px] font-semibold text-[#171717] mb-3.5">
                Quick actions
              </h2>
              <div
                className={`grid gap-2 ${
                  authorizedShortcuts.length === 4
                    ? 'grid-cols-4'
                    : authorizedShortcuts.length === 3
                      ? 'grid-cols-3'
                      : authorizedShortcuts.length === 2
                        ? 'grid-cols-2'
                        : 'grid-cols-1'
                }`}
              >
                {authorizedShortcuts.map((shortcut) => {
                  const Icon = getShortcutIcon(shortcut.id);
                  return (
                    <button
                      key={shortcut.id}
                      type="button"
                      onClick={() => handleShortcutPress(shortcut.id)}
                      className="group flex flex-col items-center gap-1.5 py-1 focus-visible:outline-2 focus-visible:outline-[#0A66C2] rounded-lg cursor-pointer"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F2EF] group-hover:bg-[#E5E7EB] transition-colors">
                        <Icon
                          className="h-5 w-5 text-[#404040]"
                          strokeWidth={1.75}
                        />
                      </span>
                      <span className="text-[12px] font-medium text-[#171717] text-center leading-tight">
                        {shortcut.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </LinkedInSection>
          ) : null}

          {/* 3. Pending Approvals Section */}
          <LinkedInSection>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
              <h2 className="text-[16px] font-semibold text-[#171717]">
                Pending approvals
              </h2>
              <button
                type="button"
                onClick={() => onNavigateTab('approvals')}
                className="min-h-[36px] px-1 text-[13px] font-semibold text-[#0A66C2] hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            {approvalsSectionState === 'loading' ? (
              <LinkedInLoadingRows rows={2} />
            ) : approvalsSectionState === 'error' ? (
              <LinkedInErrorState
                message="Could not fetch approval requests from the server."
                onRetry={onRetry}
              />
            ) : approvalsSectionState === 'empty' ? (
              <LinkedInEmptyState
                title="You're all caught up"
                subtitle="No pending approvals"
                variant="success"
              />
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {(pendingApprovals || []).slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 px-4 py-3.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-[#171717] truncate">
                        {item.employeeName}
                      </p>
                      <p className="text-[12px] text-[#666666] mt-0.5 truncate">
                        {item.category} · {item.durationOrAmount}
                      </p>
                    </div>
                    {canManage ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDecision(item.id, 'Approved')}
                          className="min-h-[36px] rounded-md bg-[#0A66C2] px-3.5 text-xs font-semibold text-white hover:bg-[#004182] transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecision(item.id, 'Rejected')}
                          className="min-h-[36px] rounded-md border border-[#E5E7EB] bg-white px-3.5 text-xs font-semibold text-[#171717] hover:bg-[#F3F2EF] transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </LinkedInSection>

          {/* 4. Announcements Section (Only shown when real announcements exist) */}
          {data && data.announcements.length > 0 ? (
            <LinkedInSection>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
                <h2 className="text-[16px] font-semibold text-[#171717]">
                  Announcements
                </h2>
                {canManage ? (
                  <button
                    type="button"
                    onClick={onOpenAnnouncement}
                    className="min-h-[36px] px-1 text-[13px] font-semibold text-[#0A66C2] hover:underline cursor-pointer"
                  >
                    New notice
                  </button>
                ) : null}
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {data.announcements.slice(0, 3).map((ann) => (
                  <div key={ann.id} className="px-4 py-3.5">
                    <p className="text-[14px] font-semibold text-[#171717]">
                      {ann.title}
                    </p>
                    <p className="mt-0.5 text-[12px] text-[#666666]">
                      {ann.category} · {ann.department}
                    </p>
                    <p className="mt-1.5 text-[13px] text-[#404040] leading-relaxed">
                      {ann.description}
                    </p>
                  </div>
                ))}
              </div>
            </LinkedInSection>
          ) : null}
        </div>
      ) : null}

      {activeHomeTab === 'shifts' && data ? (
        <ShiftsAndRostersScreen
          mode="shifts"
          shifts={data.shifts}
          rosters={data.rosters}
          isDark={isDark}
          canManage={canManage}
          onSuccessToast={onSuccessToast}
        />
      ) : null}

      {activeHomeTab === 'rosters' && data ? (
        <ShiftsAndRostersScreen
          mode="rosters"
          shifts={data.shifts}
          rosters={data.rosters}
          isDark={isDark}
          canManage={canManage}
          onSuccessToast={onSuccessToast}
        />
      ) : null}

      {activeHomeTab === 'holidays' && data ? (
        <HolidayCalendarScreen
          holidays={data.holidays}
          isDark={isDark}
          canManage={canManage}
          onSuccessToast={onSuccessToast}
        />
      ) : null}
    </div>
  );
}
