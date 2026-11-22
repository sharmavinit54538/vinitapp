'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { authClient } from '@/lib/auth-api';
import {
  canRoleAccessRoute,
  getDefaultRouteForRole,
  normalizeRole,
} from '@/lib/route-guards';
import { Ofc360Role } from '@/lib/auth-schemas';

function readActiveAuthenticatedRole(): Ofc360Role | null {
  const cached = authClient.getCachedUser();
  if (cached?.role) {
    return normalizeRole(cached.role);
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem('ofc360_local_auth_user_v1');
      if (raw) {
        const parsed = JSON.parse(raw) as { role?: string } | null;
        if (parsed?.role) {
          return normalizeRole(parsed.role);
        }
      }
    } catch {
      return null;
    }
  }
  return null;
}

function subscribeAuthRole(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', onStoreChange);
  return () => window.removeEventListener('storage', onStoreChange);
}

interface RoleRouteGuardProps {
  routePath: string;
  children: React.ReactNode;
}

export function RoleRouteGuard({ routePath, children }: RoleRouteGuardProps) {
  const pathname = usePathname() || routePath;
  const router = useRouter();
  const activeRole = useSyncExternalStore(
    subscribeAuthRole,
    readActiveAuthenticatedRole,
    () => null
  );

  const isBlocked = Boolean(activeRole && !canRoleAccessRoute(activeRole, pathname));

  if (isBlocked && activeRole) {
    const fallbackPath = getDefaultRouteForRole(activeRole);
    const portalTitle =
      activeRole === 'executive'
        ? 'Executive Command Center'
        : activeRole === 'it_admin'
          ? 'IT Admin Portal'
          : activeRole === 'manager'
            ? 'Manager Portal'
            : activeRole === 'hr_admin'
              ? 'HR Admin Portal'
              : 'Employee Portal';
    return (
      <div
        data-testid="rbac-forbidden-guard"
        className="min-h-screen bg-[#F3F2EF] flex items-center justify-center p-4"
      >
        <div className="w-full max-w-[420px] rounded-lg border border-[#E5E7EB] bg-white p-6 text-center space-y-4">
          <div className="mx-auto w-11 h-11 rounded-md bg-[#FEF2F2] text-[#B91C1C] flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#B91C1C] uppercase tracking-wide">
              403 · Access restricted
            </p>
            <h1 className="text-[17px] font-semibold text-[#171717]">
              Administrative route protected
            </h1>
            <p className="text-[13px] text-[#666666] leading-relaxed">
              Your signed-in role (<span className="font-semibold text-[#171717]">{activeRole}</span>) does not have permission to access this route.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => router.push(fallbackPath)}
              className="w-full min-h-[40px] rounded-md bg-[#0A66C2] hover:bg-[#004182] text-white text-[13px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to {portalTitle}
            </button>
            <Link
              href="/login"
              onClick={() => {
                authClient.clearSession();
                void authClient.logout();
              }}
              className="w-full min-h-[40px] rounded-md border border-[#E5E7EB] text-[#171717] text-[13px] font-medium flex items-center justify-center hover:bg-[#F3F2EF] transition-colors"
            >
              Sign in with a different role
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
