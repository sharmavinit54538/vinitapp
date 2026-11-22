'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  HrDashboardDataState,
  MoreModuleId,
  getMoreModulesCatalog,
  BottomNavTab,
  HomeInternalTab,
} from '@/lib/hr-dashboard-logic';
import { ShiftsAndRostersScreen } from './ShiftsAndRostersScreen';
import { PayrollWorkspaceShell } from '../components/payroll/PayrollWorkspaceShell';
import { RecruitmentWorkspaceShell } from '../components/recruitment/RecruitmentWorkspaceShell';
import { OnboardingWorkspaceShell } from '../components/onboarding/OnboardingWorkspaceShell';
import { AssetWorkspaceShell } from '../components/assets/AssetWorkspaceShell';
import { HolidayWorkspaceShell } from '../components/holidays/HolidayWorkspaceShell';
import { VisitorWorkspaceShell } from '../components/visitors/VisitorWorkspaceShell';
import { AttendanceAnalyticsWorkspaceShell } from '../components/attendance-analytics/AttendanceAnalyticsWorkspaceShell';
import { SettingsWorkspaceShell } from '../components/settings/SettingsWorkspaceShell';
import { EmployeeDocumentsWorkspaceShell } from '../components/documents/EmployeeDocumentsWorkspaceShell';
import { TravelDeskWorkspaceShell } from '../components/travel-desk/TravelDeskWorkspaceShell';
import { PerformanceGoalsWorkspaceShell } from '../components/performance/PerformanceGoalsWorkspaceShell';
import { HelpDeskApp } from '@/components/helpdesk/helpdesk-app';
import { LinkedInSection } from '@/src/components/linkedin/LinkedInPrimitives';

interface MoreModulesScreenProps {
  data: HrDashboardDataState;
  activeSubModule: MoreModuleId | null;
  onSelectSubModule: (id: MoreModuleId | null) => void;
  onNavigateBottomTab: (tab: BottomNavTab) => void;
  onSelectHomeTab: (tab: HomeInternalTab) => void;
  onOpenAnnouncement: () => void;
  isDark: boolean;
  canManage: boolean;
  onSuccessToast: (msg: string) => void;
}

const DIRECT_MODULE_ROUTES: Partial<Record<MoreModuleId, string>> = {
  workforce_analytics: '/admin/workforce',
};

export function MoreModulesScreen({
  data,
  activeSubModule,
  onSelectSubModule,
  onNavigateBottomTab,
  onSelectHomeTab,
  onOpenAnnouncement,
  isDark,
  canManage,
  onSuccessToast,
}: MoreModulesScreenProps) {
  const router = useRouter();
  const catalog = getMoreModulesCatalog(data);

  const handleDirectModuleOpen = (id: MoreModuleId) => {
    if (id === 'my_profile') {
      onNavigateBottomTab('profile');
      return;
    }
    if (id === 'shifts_rosters') {
      onNavigateBottomTab('home');
      onSelectHomeTab('shifts');
      return;
    }
    if (id === 'announcements') {
      onOpenAnnouncement();
      return;
    }
    const targetRoute = DIRECT_MODULE_ROUTES[id];
    if (targetRoute) {
      router.push(targetRoute);
      return;
    }
    onSelectSubModule(id);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0 });
    }
  };

  if (activeSubModule) {
    const modMeta = catalog.find((m) => m.id === activeSubModule);

    return (
      <div className="flex flex-col">
        <div className="w-full">
          {activeSubModule === 'holidays' ? (
            <HolidayWorkspaceShell
              embedded
              startInDirectory={true}
              initialModule="dashboard"
            />
          ) : activeSubModule === 'shifts_rosters' ? (
            <ShiftsAndRostersScreen
              mode="shifts"
              shifts={data.shifts}
              rosters={data.rosters}
              isDark={isDark}
              canManage={canManage}
              onSuccessToast={onSuccessToast}
            />
          ) : activeSubModule === 'payroll' ? (
            <PayrollWorkspaceShell
              embedded
              startInDirectory={true}
              initialModule="dashboard"
              onBackFromEmbedded={() => onSelectSubModule(null)}
            />
          ) : activeSubModule === 'payroll_analytics' ? (
            <PayrollWorkspaceShell
              embedded
              startInDirectory={false}
              initialModule="reports"
              onBackFromEmbedded={() => onSelectSubModule(null)}
            />
          ) : activeSubModule === 'exit_management' ? (
            <PayrollWorkspaceShell
              embedded
              startInDirectory={false}
              initialModule="fnf-settlement"
              onBackFromEmbedded={() => onSelectSubModule(null)}
            />
          ) : activeSubModule === 'compliance_center' ? (
            <PayrollWorkspaceShell
              embedded
              startInDirectory={false}
              initialModule="statutory"
              onBackFromEmbedded={() => onSelectSubModule(null)}
            />
          ) : activeSubModule === 'recruitment' ? (
            <RecruitmentWorkspaceShell
              embedded
              startInDirectory={true}
              initialModule="dashboard"
              onBackFromEmbedded={() => onSelectSubModule(null)}
            />
          ) : activeSubModule === 'onboarding' ? (
            <OnboardingWorkspaceShell embedded startInDirectory={true} initialModule="dashboard" />
          ) : activeSubModule === 'asset_management' ? (
            <AssetWorkspaceShell embedded startInDirectory={true} initialModule="dashboard" />
          ) : activeSubModule === 'visitor_management' ? (
            <VisitorWorkspaceShell embedded startInDirectory={true} initialModule="dashboard" />
          ) : activeSubModule === 'attendance_analytics' ? (
            <AttendanceAnalyticsWorkspaceShell embedded startInDirectory={true} initialModule="overview" />
          ) : activeSubModule === 'travel_desk' ? (
            <TravelDeskWorkspaceShell
              embedded
              startInDirectory={true}
              onBackFromEmbedded={() => onSelectSubModule(null)}
            />
          ) : activeSubModule === 'performance_goals' ? (
            <PerformanceGoalsWorkspaceShell
              embedded
              onBackFromEmbedded={() => onSelectSubModule(null)}
            />
          ) : activeSubModule === 'employee_documents' ||
            activeSubModule === 'documents_policies' ? (
            <EmployeeDocumentsWorkspaceShell
              embedded
              startInDirectory={true}
              initialModule="overview"
            />
          ) : activeSubModule === 'settings' ? (
            <SettingsWorkspaceShell onSuccessToast={onSuccessToast} />
          ) : activeSubModule === 'help_support' ? (
            <HelpDeskApp embedded startInDirectory initialNavId="overview" />
          ) : (
            <LinkedInSection className="p-4">
              <h2 className="text-[16px] font-semibold text-[#171717]">
                {modMeta?.title}
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (activeSubModule === 'announcements') {
                    onOpenAnnouncement();
                  } else {
                    onSuccessToast(`${modMeta?.title} synchronized`);
                  }
                }}
                className="mt-4 h-9 rounded-md bg-[#0A66C2] px-4 text-[13px] font-semibold text-white hover:bg-[#004182] transition-colors cursor-pointer"
              >
                {activeSubModule === 'announcements'
                  ? 'Broadcast new notice'
                  : `Open ${modMeta?.title}`}
              </button>
            </LinkedInSection>
          )}
        </div>
      </div>
    );
  }

  return (
    <LinkedInSection>
      <div className="divide-y divide-[#E5E7EB]">
        {catalog.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleDirectModuleOpen(item.id)}
            className="flex min-h-[48px] w-full items-center px-4 py-3 text-left hover:bg-[#F3F2EF] transition-colors cursor-pointer"
          >
            <span className="text-[14px] font-medium text-[#171717]">
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </LinkedInSection>
  );
}
