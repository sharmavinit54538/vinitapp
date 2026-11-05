'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import {
  AegisAuthView,
  AuthLayout,
  AuthCard,
  AuthSuccessState,
} from './shared';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';
import { OtpVerificationForm } from './otp-verification-form';
import { MfaVerificationForm } from './mfa-verification-form';
import {
  ForgotPasswordForm,
  ResetPasswordForm,
} from './forgot-and-reset-password';
import { EmailVerificationView } from './email-verification-view';
import { ChangePasswordForm } from './change-password-form';
import { HrMobileAppShell } from '@/components/hr-mobile/hr-mobile-shell';
import { Ofc360User, authClient } from '@/lib/auth-api';
import { Ofc360Role, resolveRoleDashboardPath } from '@/lib/auth-schemas';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export type TopSectionTab = 'auth' | 'verification' | 'roles' | 'studio';

interface Ofc360AuthPortalProps {
  initialView?: AegisAuthView;
  initialSection?: TopSectionTab;
  initialRolePreview?: Ofc360Role;
}

export function Ofc360AuthPortal({
  initialView = 'login',
  initialSection = 'auth',
  initialRolePreview = 'hr_admin',
}: Ofc360AuthPortalProps) {
  const [authView, setAuthView] = useState<AegisAuthView>(() => {
    if (typeof window !== 'undefined') {
      const viewParam = new URLSearchParams(window.location.search).get('view') as AegisAuthView | null;
      if (viewParam) return viewParam;
    }
    return initialView;
  });
  const [sharedIdentifier, setSharedIdentifier] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('email') || '';
    }
    return '';
  });
  const [urlToken] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('token') || '';
    }
    return '';
  });
  const [currentUser, setCurrentUser] = useState<Ofc360User | null>(null);
  const [sessionBanner, setSessionBanner] = useState<string | null>(null);
  const [showMobileDashboard, setShowMobileDashboard] = useState<boolean>(
    initialSection === 'roles'
  );

  const handleNavigateAuth = (
    nextView: AegisAuthView,
    identifier?: string
  ) => {
    if (identifier !== undefined) {
      setSharedIdentifier(identifier);
    }
    setAuthView(nextView);
    if (typeof window !== 'undefined') {
      const routeMap: Record<AegisAuthView, string> = {
        login: '/login',
        register: '/register',
        'verify-otp': '/verify-otp',
        'mfa-verify': '/mfa-verify',
        'forgot-password': '/forgot-password',
        'reset-password': '/reset-password',
        'verify-email': '/verify-email',
        'activate-account': '/activate',
        'change-password': '/change-password',
      };
      const nextUrl = routeMap[nextView] || '/login';
      if (window.location.pathname !== nextUrl) {
        window.history.pushState(null, '', nextUrl);
      }
    }
  };

  const handleAuthSuccess = (user: Ofc360User) => {
    setCurrentUser(user);
    const targetRoute = resolveRoleDashboardPath(user.role);
    setSessionBanner(
      `Signed in as ${user.email} (${user.role}). Authorized workspace: ${targetRoute}`
    );
    setShowMobileDashboard(true);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', targetRoute);
    }
  };

  if (initialSection === 'roles' || showMobileDashboard) {
    return (
      <HrMobileAppShell
        initialRole={currentUser?.role || initialRolePreview}
      />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthLayout activeView={authView} onSelectView={handleNavigateAuth}>
        <AuthCard
          className={
            authView === 'register' ? 'max-w-[580px]' : 'max-w-[440px]'
          }
        >
          {sessionBanner && (
            <AuthSuccessState
              title="Authenticated Session Active"
              message={sessionBanner}
              actionLabel="Change Password"
              onAction={() => {
                setSessionBanner(null);
                setAuthView('change-password');
              }}
              secondaryActionLabel="Sign Out"
              onSecondaryAction={async () => {
                await authClient.logout();
                setCurrentUser(null);
                setSessionBanner(null);
                setAuthView('login');
              }}
            />
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={authView}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {authView === 'login' && (
                <LoginForm
                  onNavigate={handleNavigateAuth}
                  onAuthSuccess={handleAuthSuccess}
                  initialEmail={sharedIdentifier}
                />
              )}

              {authView === 'register' && (
                <RegisterForm
                  onNavigate={handleNavigateAuth}
                  initialEmail={sharedIdentifier}
                />
              )}

              {authView === 'verify-otp' && (
                <OtpVerificationForm
                  email={sharedIdentifier}
                  onEmailChange={setSharedIdentifier}
                  onNavigate={handleNavigateAuth}
                  onAuthSuccess={handleAuthSuccess}
                />
              )}

              {authView === 'mfa-verify' && (
                <MfaVerificationForm
                  identifier={sharedIdentifier}
                  onNavigate={handleNavigateAuth}
                  onAuthSuccess={handleAuthSuccess}
                />
              )}

              {authView === 'forgot-password' && (
                <ForgotPasswordForm
                  onNavigate={handleNavigateAuth}
                  initialEmail={sharedIdentifier}
                />
              )}

              {authView === 'reset-password' && (
                <ResetPasswordForm
                  onNavigate={handleNavigateAuth}
                  initialToken={urlToken}
                />
              )}

              {authView === 'verify-email' && (
                <EmailVerificationView
                  email={sharedIdentifier}
                  onEmailChange={setSharedIdentifier}
                  onNavigate={handleNavigateAuth}
                  initialToken={urlToken}
                  initialFlow="verify-email"
                />
              )}

              {authView === 'activate-account' && (
                <EmailVerificationView
                  email={sharedIdentifier}
                  onEmailChange={setSharedIdentifier}
                  onNavigate={handleNavigateAuth}
                  initialToken={urlToken}
                  initialFlow="activate-account"
                />
              )}

              {authView === 'change-password' && (
                <ChangePasswordForm onNavigate={handleNavigateAuth} />
              )}
            </motion.div>
          </AnimatePresence>
        </AuthCard>

        {authView === 'login' && (
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => handleNavigateAuth('register', sharedIdentifier)}
              className="font-bold text-slate-900 dark:text-white hover:underline cursor-pointer"
            >
              Create account
            </button>
          </p>
        )}

        {authView === 'register' && (
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => handleNavigateAuth('login', sharedIdentifier)}
              className="font-bold text-slate-900 dark:text-white hover:underline cursor-pointer"
            >
              Sign in
            </button>
          </p>
        )}

        {(authView === 'forgot-password' || authView === 'reset-password') && (
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Remembered your password?{' '}
            <button
              type="button"
              onClick={() => handleNavigateAuth('login', sharedIdentifier)}
              className="font-bold text-slate-900 dark:text-white hover:underline cursor-pointer"
            >
              Back to sign in
            </button>
          </p>
        )}
      </AuthLayout>
    </QueryClientProvider>
  );
}
