'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-api';
import { HrDashboardDataState } from '@/lib/hr-dashboard-logic';
import { getInitials } from '@/src/lib/linkedin-ui-helpers';
import { LinkedInSection } from '@/src/components/linkedin/LinkedInPrimitives';
import { PWAInstallButton } from '@/src/components/mobile/PWAInstallAndStatus';

interface ProfileScreenProps {
  data: HrDashboardDataState;
  isDark: boolean;
  onSuccessToast: (msg: string) => void;
  onLogout?: () => void;
}

export function ProfileScreen({ data, onLogout }: ProfileScreenProps) {
  const router = useRouter();
  const profile = data.adminProfile;
  const initials = getInitials(profile.name);

  const handleLogoutClick = () => {
    authClient.clearSession();
    void authClient.logout();
    if (onLogout) {
      onLogout();
      return;
    }
    router.push('/login');
  };

  return (
    <div className="flex flex-col gap-2 md:gap-3">
      <LinkedInSection>
        <div className="flex items-center gap-3.5 px-4 py-4 border-b border-[#E5E7EB]">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#171717] text-[18px] font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[18px] font-semibold text-[#171717] tracking-[-0.01em]">
              {profile.name || 'Account profile'}
            </h1>
            <p className="truncate text-[13px] text-[#666666]">
              {profile.designation || 'HR Operations'}
              {profile.employeeId ? ` · ${profile.employeeId}` : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:gap-px bg-[#E5E7EB]">
          <div className="bg-white px-4 py-3.5">
            <p className="text-[11px] font-medium text-[#666666]">Work email</p>
            <p className="mt-0.5 text-[14px] font-medium text-[#171717]">
              {profile.email || '—'}
            </p>
          </div>
          <div className="bg-white px-4 py-3.5">
            <p className="text-[11px] font-medium text-[#666666]">Department</p>
            <p className="mt-0.5 text-[14px] font-medium text-[#171717]">
              {profile.department || '—'}
            </p>
          </div>
          <div className="bg-white px-4 py-3.5">
            <p className="text-[11px] font-medium text-[#666666]">Primary office</p>
            <p className="mt-0.5 text-[14px] font-medium text-[#171717]">
              {profile.location || '—'}
            </p>
          </div>
          <div className="bg-white px-4 py-3.5">
            <p className="text-[11px] font-medium text-[#666666]">Access level</p>
            <p className="mt-0.5 text-[14px] font-medium text-[#15803D]">
              Verified HR Admin
            </p>
          </div>
        </div>

        <div className="border-t border-[#E5E7EB] px-4 py-3.5 flex flex-wrap items-center gap-2.5">
          <PWAInstallButton compact />
          <button
            type="button"
            aria-label="Logout"
            onClick={handleLogoutClick}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 text-[13px] font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.9} />
            Sign out
          </button>
        </div>
      </LinkedInSection>
    </div>
  );
}
