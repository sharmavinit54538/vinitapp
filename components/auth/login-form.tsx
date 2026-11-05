'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { emailLoginSchema, LoginFormValues } from '@/lib/auth-schemas';
import { authClient, AuthApiError, Ofc360User } from '@/lib/auth-api';
import {
  AegisAuthView,
  AuthHeader,
  AuthSubmitButton,
  FieldFeedbackMessage,
  AuthErrorMessage,
  AuthSuccessState,
} from './shared';
import { Eye, EyeOff, Check } from 'lucide-react';

export type AuthViewType = AegisAuthView;

interface LoginFormProps {
  onNavigate: (view: AegisAuthView, identifier?: string) => void;
  onAuthSuccess: (user: Ofc360User) => void;
  initialEmail?: string;
}

export function LoginForm({
  onNavigate,
  onAuthSuccess,
  initialEmail = '',
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLockedSubmitting, setIsLockedSubmitting] = useState(false);
  const inFlightRef = useRef(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<{
    type: 'unverified_email' | 'inactive_account' | 'info';
    title: string;
    message: string;
    identifier?: string;
  } | null>(null);

  const emailForm = useForm<LoginFormValues>({
    resolver: zodResolver(emailLoginSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      email: initialEmail || 'hradmin@ofc360.com',
      password: 'Admin@360',
      remember_me: false,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = emailForm;

  const isBusy = isSubmitting || isLockedSubmitting;
  const currentEmail = watch('email');
  const rememberMe = watch('remember_me');

  const handleAuthResponseOrError = async (
    identifier: string,
    execLogin: () => ReturnType<typeof authClient.login>
  ) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsLockedSubmitting(true);
    setServerError(null);
    setStatusNotice(null);

    try {
      const loginRes = await execLogin();

      if (loginRes.requires_mfa) {
        onNavigate('mfa-verify', identifier);
        return;
      }

      if (loginRes.requires_otp) {
        onNavigate('verify-otp', identifier);
        return;
      }

      if (loginRes.email_verified === false) {
        setStatusNotice({
          type: 'unverified_email',
          title: 'Email Verification Required',
          message:
            'Your email address has not been verified yet. Complete email verification to access your workspace.',
          identifier,
        });
        return;
      }

      if (loginRes.is_active === false) {
        setStatusNotice({
          type: 'inactive_account',
          title: 'Account Activation Required',
          message:
            'Your enterprise account is currently inactive. Activate your account to continue.',
          identifier,
        });
        return;
      }

      const profile = await authClient.getMe();
      onAuthSuccess(profile);
    } catch (err) {
      if (err instanceof AuthApiError) {
        if (err.requiresMfa) {
          onNavigate('mfa-verify', identifier);
          return;
        }
        if (err.requiresOtp) {
          onNavigate('verify-otp', identifier);
          return;
        }
        if (err.emailUnverified) {
          setStatusNotice({
            type: 'unverified_email',
            title: 'Email Verification Required',
            message: err.message,
            identifier,
          });
          return;
        }
        if (err.accountInactive) {
          setStatusNotice({
            type: 'inactive_account',
            title: 'Account Activation Required',
            message: err.message,
            identifier,
          });
          return;
        }
        setServerError(err.message);
      } else {
        setServerError(
          err instanceof Error
            ? err.message
            : 'Unable to sign in right now. Please try again.'
        );
      }
    } finally {
      inFlightRef.current = false;
      setIsLockedSubmitting(false);
    }
  };

  const onSubmitEmail = async (values: LoginFormValues) => {
    const cleanEmail = values.email.trim();
    await handleAuthResponseOrError(cleanEmail, () =>
      authClient.login({
        email: cleanEmail,
        password: values.password,
        remember_me: Boolean(values.remember_me),
      })
    );
  };

  const getInputClass = (hasError: boolean, extra = '') =>
    `w-full h-12 rounded-xl border bg-white dark:bg-slate-900 px-4 text-[15px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
      hasError
        ? 'border-rose-300 dark:border-rose-800/80 focus:border-rose-500 focus:ring-rose-500/15'
        : 'border-slate-200 dark:border-slate-800 focus:border-slate-900 dark:focus:border-indigo-500 focus:ring-slate-900/10 dark:focus:ring-indigo-500/15'
    } ${extra}`;

  return (
    <div data-testid="login-view">
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to your OFC360 workspace"
      />

      {/* Email Verification / Account Activation Status Notice */}
      {statusNotice && (
        <AuthSuccessState
          title={statusNotice.title}
          message={statusNotice.message}
          actionLabel={
            statusNotice.type === 'unverified_email'
              ? 'Verify Email'
              : 'Activate Account'
          }
          onAction={() =>
            onNavigate(
              statusNotice.type === 'unverified_email'
                ? 'verify-email'
                : 'activate-account',
              statusNotice.identifier || currentEmail
            )
          }
        />
      )}

      {/* Backend Error Alert */}
      <AuthErrorMessage message={serverError} testId="login-error-alert" />

      <form
        onSubmit={handleSubmit(onSubmitEmail)}
        className="space-y-5"
        noValidate
      >
        {/* Work email */}
        <div className="relative">
          <label
            htmlFor="login-email"
            className="block text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-2"
          >
            Work email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            disabled={isBusy}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            placeholder="hradmin@ofc360.com"
            className={getInputClass(Boolean(errors.email))}
            {...register('email', {
              onChange: () => {
                if (serverError) setServerError(null);
              },
            })}
          />
          <FieldFeedbackMessage
            id="login-email-error"
            error={errors.email?.message}
          />
        </div>

        {/* Password + Forgot Password */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="login-password"
              className="text-[13px] font-semibold text-slate-900 dark:text-slate-100"
            >
              Password
            </label>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onNavigate('forgot-password', currentEmail)}
              className="text-[13px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              Forgot Password
            </button>
          </div>

          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              disabled={isBusy}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? 'login-password-error' : undefined
              }
              placeholder="••••••••••••••••"
              className={getInputClass(Boolean(errors.password), 'pr-11')}
              {...register('password', {
                onChange: () => {
                  if (serverError) setServerError(null);
                },
              })}
            />
            <button
              type="button"
              disabled={isBusy}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4.5 h-4.5" />
              ) : (
                <Eye className="w-4.5 h-4.5" />
              )}
            </button>
          </div>
          <FieldFeedbackMessage
            id="login-password-error"
            error={errors.password?.message}
          />
        </div>

        {/* Circular Remember me on this device checkbox */}
        <div>
          <label
            htmlFor="login-remember"
            className="inline-flex items-center gap-2.5 text-[13px] text-slate-500 dark:text-slate-400 cursor-pointer select-none"
          >
            <input
              id="login-remember"
              type="checkbox"
              disabled={isBusy}
              className="sr-only"
              checked={Boolean(rememberMe)}
              onChange={(e) => setValue('remember_me', e.target.checked)}
            />
            <span
              aria-hidden="true"
              className={`w-[18px] h-[18px] rounded-full flex items-center justify-center border transition-all shrink-0 ${
                rememberMe
                  ? 'bg-[#0B1120] border-[#0B1120] text-white dark:bg-indigo-600 dark:border-indigo-600'
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'
              }`}
            >
              {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
            </span>
            <span>Remember me on this device</span>
          </label>
        </div>

        {/* Full-width dark 'Sign in with password' button */}
        <div className="pt-1">
          <AuthSubmitButton
            isLoading={isBusy}
            loadingText="Signing in..."
            data-testid="login-submit-button"
          >
            Sign in with password
          </AuthSubmitButton>
        </div>
      </form>
    </div>
  );
}
