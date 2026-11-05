'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  changePasswordSchema,
  ChangePasswordFormValues,
  OFC360_ROLES,
  Ofc360Role,
  ROLE_ROUTES,
  resolveRoleDashboardPath,
} from '@/lib/auth-schemas';
import {
  authClient,
  AuthApiError,
  Ofc360User,
  AUTH_API_PREFIX,
} from '@/lib/auth-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordStrengthMeter } from './password-strength-meter';
import { AuthViewType } from './login-form';
import {
  Shield,
  LogOut,
  RefreshCw,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  UserCheck,
  ArrowUpRight,
} from 'lucide-react';

interface ProtectedRoleDashboardProps {
  currentUser: Ofc360User | null;
  onUserUpdated: (user: Ofc360User | null) => void;
  onNavigateAuth: (view: AuthViewType) => void;
  selectedPreviewRole?: Ofc360Role;
}

export function ProtectedRoleDashboard({
  currentUser,
  onUserUpdated,
  onNavigateAuth,
  selectedPreviewRole = 'hr_admin',
}: ProtectedRoleDashboardProps) {
  const [activeRoleTab, setActiveRoleTab] = useState<Ofc360Role>(
    currentUser?.role || selectedPreviewRole
  );
  const [isCheckingMe, setIsCheckingMe] = useState(false);
  const [ isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sessionStatusMsg, setSessionStatusMsg] = useState<string | null>(null);
  const [sessionErrorMsg, setSessionErrorMsg] = useState<string | null>(null);

  // Change password state (`POST /api/v1/auth/change-password`)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changePwdSuccess, setChangePwdSuccess] = useState<string | null>(null);
  const [changePwdError, setChangePwdError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting: isChangingPassword },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const watchedNewPwd = watch('new_password', '');

  const handleFetchMe = async () => {
    setIsCheckingMe(true);
    setSessionErrorMsg(null);
    setSessionStatusMsg(null);
    try {
      const profile = await authClient.getMe();
      onUserUpdated(profile);
      setActiveRoleTab(profile.role);
      setSessionStatusMsg(
        `Verified authenticated user ${profile.email} with role "${profile.role}" → authorized route ${resolveRoleDashboardPath(
          profile.role
        )}.`
      );
    } catch (err) {
      setSessionErrorMsg(
        err instanceof Error
          ? err.message
          : 'Unable to verify session via GET /api/v1/auth/me.'
      );
    } finally {
      setIsCheckingMe(false);
    }
  };

  const handleTriggerRefresh = async () => {
    setIsRefreshingToken(true);
    setSessionErrorMsg(null);
    setSessionStatusMsg(null);
    try {
      const token = await authClient.refreshAccessToken();
      if (token) {
        setSessionStatusMsg(
          'Access token refreshed via POST /api/v1/auth/refresh and stored strictly in memory.'
        );
      } else {
        setSessionErrorMsg(
          'Token refresh returned no active session from POST /api/v1/auth/refresh. Please sign in.'
        );
      }
    } catch (err) {
      setSessionErrorMsg(
        err instanceof Error ? err.message : 'Token refresh failed.'
      );
    } finally {
      setIsRefreshingToken(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setSessionErrorMsg(null);
    try {
      await authClient.logout();
      onUserUpdated(null);
      onNavigateAuth('login');
    } catch (err) {
      onUserUpdated(null);
      setSessionErrorMsg(
        err instanceof Error ? err.message : 'Logged out locally.'
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const onSubmitChangePassword = async (values: ChangePasswordFormValues) => {
    setChangePwdError(null);
    setChangePwdSuccess(null);
    try {
      const res = await authClient.changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      });
      setChangePwdSuccess(res.message);
      reset();
    } catch (err) {
      if (err instanceof AuthApiError) {
        setChangePwdError(err.message);
      } else {
        setChangePwdError(
          err instanceof Error
            ? err.message
            : 'Could not change password via POST /api/v1/auth/change-password.'
        );
      }
    }
  };

  const activeRouteInfo = ROLE_ROUTES[activeRoleTab];

  return (
    <div className="space-y-8" data-testid="role-security-workspace">
      {/* Top Session & Role Guard Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span>RBAC SESSION GUARD</span>
            <span aria-hidden="true">·</span>
            <span>{AUTH_API_PREFIX}/me</span>
          </div>
          <h2
            className="text-xl font-bold tracking-tight text-[#081B3A]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {currentUser
              ? `Authenticated as ${currentUser.full_name} (${currentUser.role})`
              : 'Unauthenticated Session — Protected Route Guard Active'}
          </h2>
          <p className="text-sm text-slate-600">
            {currentUser
              ? `Authorized destination: ${resolveRoleDashboardPath(
                  currentUser.role
                )} · Email verified: ${
                  currentUser.email_verified ? 'Yes' : 'No'
                } · Active: ${currentUser.is_active ? 'Yes' : 'No'}`
              : 'All protected routes verify the session with GET /api/v1/auth/me and enforce backend role authorization.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="default"
            disabled={isCheckingMe}
            onClick={handleFetchMe}
          >
            {isCheckingMe ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#0052FF]" />
            ) : (
              <UserCheck className="w-4 h-4 text-[#0052FF]" />
            )}
            Verify /auth/me
          </Button>

          <Button
            type="button"
            variant="outline"
            size="default"
            disabled={isRefreshingToken}
            onClick={handleTriggerRefresh}
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshingToken ? 'animate-spin' : ''}`}
            />
            Refresh Token
          </Button>

          {currentUser ? (
            <Button
              type="button"
              variant="secondary"
              size="default"
              disabled={isLoggingOut}
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? 'Signing out...' : 'Sign Out'}
            </Button>
          ) : (
            <Button
              type="button"
              size="default"
              onClick={() => onNavigateAuth('login')}
            >
              Go to Sign In →
            </Button>
          )}
        </div>
      </div>

      {sessionStatusMsg && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-xs text-emerald-950 flex items-center gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{sessionStatusMsg}</span>
        </div>
      )}

      {sessionErrorMsg && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-3 text-xs text-rose-900 flex items-center gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{sessionErrorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Role-Based Route Redirection Matrix (6 OFC360 Roles) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3
                className="text-base font-semibold text-[#081B3A]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                OFC360 Role-Based Route Redirection Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Roles are strictly assigned by the backend (
                <code className="font-mono text-[#081B3A]">/api/v1/auth/me</code>
                ) and never selectable during registration.
              </p>
            </div>
            <Shield className="w-5 h-5 text-[#0052FF] shrink-0" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {OFC360_ROLES.map((roleKey) => {
              const info = ROLE_ROUTES[roleKey];
              const isSelected = activeRoleTab === roleKey;
              const isCurrentUserRole = currentUser?.role === roleKey;

              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => setActiveRoleTab(roleKey)}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'border-[#0052FF] bg-[#F8FAFC] ring-1 ring-[#0052FF]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[#0052FF]">
                        {roleKey}
                      </span>
                      {isCurrentUserRole && (
                        <span className="text-[10px] font-mono font-semibold text-emerald-700">
                          ACTIVE SESSION
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-[#081B3A]">
                      {info.label}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {info.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>{info.path}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#0052FF]" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Role Route Detail Box */}
          <div className="rounded-xl bg-[#F8FAFC] border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-mono text-[#0052FF] font-semibold">
                {activeRouteInfo.role} → {activeRouteInfo.path}
              </div>
              <div className="text-sm font-semibold text-[#081B3A]">
                {activeRouteInfo.label}
              </div>
              <p className="text-xs text-slate-600">
                {activeRouteInfo.description}
              </p>
            </div>
            <a
              href={activeRouteInfo.path}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#081B3A] hover:bg-[#0052FF] rounded-lg transition-colors whitespace-nowrap shrink-0 text-center"
            >
              Open Route {activeRouteInfo.path}
            </a>
          </div>
        </div>

        {/* Right 5 Columns: Change Password (`POST /api/v1/auth/change-password`) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3
                className="text-base font-semibold text-[#081B3A]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Change Account Password
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                POST /api/v1/auth/change-password
              </p>
            </div>
            <Lock className="w-4 h-4 text-[#0052FF] shrink-0" />
          </div>

          {changePwdSuccess && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-2.5 text-xs text-emerald-950 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{changePwdSuccess}</span>
            </div>
          )}

          {changePwdError && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50/70 px-3.5 py-2.5 text-xs text-rose-900 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{changePwdError}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmitChangePassword)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="change-current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="change-current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  className="pr-10"
                  {...register('current_password')}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((s) => !s)}
                  aria-label={
                    showCurrentPassword ? 'Hide password' : 'Show password'
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#081B3A]"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.current_password && (
                <p role="alert" className="text-xs text-rose-600 font-medium">
                  {errors.current_password.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="change-new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="change-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter strong new password"
                  className="pr-10"
                  {...register('new_password')}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((s) => !s)}
                  aria-label={
                    showNewPassword ? 'Hide new password' : 'Show new password'
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#081B3A]"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.new_password && (
                <p role="alert" className="text-xs text-rose-600 font-medium">
                  {errors.new_password.message}
                </p>
              )}
              <PasswordStrengthMeter password={watchedNewPwd} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="change-confirm-password">
                Confirm New Password
              </Label>
              <Input
                id="change-confirm-password"
                type="password"
                placeholder="Confirm new password"
                {...register('confirm_password')}
              />
              {errors.confirm_password && (
                <p role="alert" className="text-xs text-rose-600 font-medium">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isChangingPassword}
              className="w-full"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
