'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  forgotPasswordSchema,
  ForgotPasswordFormValues,
  resetPasswordSchema,
  ResetPasswordFormValues,
} from '@/lib/auth-schemas';
import { authClient, AuthApiError } from '@/lib/auth-api';
import {
  AegisAuthView,
  AuthHeader,
  AuthSubmitButton,
  FieldFeedbackMessage,
  AuthErrorMessage,
  AuthSuccessState,
} from './shared';
import { Eye, EyeOff } from 'lucide-react';

interface ForgotPasswordFormProps {
  onNavigate: (view: AegisAuthView, identifier?: string) => void;
  initialEmail?: string;
}

export function ForgotPasswordForm({
  onNavigate,
  initialEmail = '',
}: ForgotPasswordFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLockedSubmitting, setIsLockedSubmitting] = useState(false);
  const [resetDispatched, setResetDispatched] = useState<{
    email: string;
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      email: initialEmail,
    },
  });

  const isBusy = isSubmitting || isLockedSubmitting;

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    if (isLockedSubmitting) return;
    setIsLockedSubmitting(true);
    setServerError(null);
    setResetDispatched(null);

    try {
      const res = await authClient.forgotPassword({
        email: values.email.trim(),
      });
      setResetDispatched({
        email: values.email.trim(),
        message: res.message,
      });
    } catch (err) {
      if (err instanceof AuthApiError) {
        setServerError(err.message);
      } else {
        setServerError(
          err instanceof Error
            ? err.message
            : 'Unable to send verification code right now.'
        );
      }
    } finally {
      setIsLockedSubmitting(false);
    }
  };

  const getInputClass = (hasError: boolean, extra = '') =>
    `w-full h-12 rounded-xl border bg-white dark:bg-slate-900 px-4 text-[15px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
      hasError
        ? 'border-rose-300 dark:border-rose-800/80 focus:border-rose-500 focus:ring-rose-500/15'
        : 'border-slate-200 dark:border-slate-800 focus:border-slate-900 dark:focus:border-indigo-500 focus:ring-slate-900/10 dark:focus:ring-indigo-500/15'
    } ${extra}`;

  return (
    <div data-testid="forgot-password-view">
      <AuthHeader
        title="Forgot password?"
        subtitle="Enter your work email to receive a 6-digit verification code"
      />

      {resetDispatched && (
        <AuthSuccessState
          title="Verification Code Sent"
          message={resetDispatched.message}
          actionLabel="Enter 6-Digit Code →"
          onAction={() => onNavigate('verify-otp', resetDispatched.email)}
          secondaryActionLabel="Reset Password"
          onSecondaryAction={() =>
            onNavigate('reset-password', resetDispatched.email)
          }
          testId="forgot-password-success"
        />
      )}

      <AuthErrorMessage
        message={serverError}
        testId="forgot-password-error"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="relative">
          <label
            htmlFor="forgot-email"
            className="block text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-2"
          >
            Work email
          </label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            disabled={isBusy}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'forgot-email-error' : undefined}
            placeholder="name@company.com"
            className={getInputClass(Boolean(errors.email))}
            {...register('email')}
          />
          <FieldFeedbackMessage
            id="forgot-email-error"
            error={errors.email?.message}
          />
        </div>

        <div className="pt-0.5">
          <AuthSubmitButton
            isLoading={isBusy}
            loadingText="Sending verification code..."
            data-testid="forgot-submit-button"
          >
            Send verification code
          </AuthSubmitButton>
        </div>
      </form>
    </div>
  );
}

interface ResetPasswordFormProps {
  onNavigate: (view: AegisAuthView, identifier?: string) => void;
  initialToken?: string;
}

export function ResetPasswordForm({
  onNavigate,
  initialToken = '',
}: ResetPasswordFormProps) {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLockedSubmitting, setIsLockedSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resetComplete, setResetComplete] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      token: initialToken || 'ofc360-reset-token-v1',
      new_password: '',
      confirm_password: '',
    },
  });

  const isBusy = isSubmitting || isLockedSubmitting;

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (isLockedSubmitting) return;
    setIsLockedSubmitting(true);
    setServerError(null);
    setResetComplete(null);

    try {
      const res = await authClient.resetPassword({
        token: values.token.trim(),
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      });
      setResetComplete(res.message);
    } catch (err) {
      if (err instanceof AuthApiError) {
        setServerError(err.message);
      } else {
        setServerError(
          err instanceof Error
            ? err.message
            : 'Unable to reset password. Verify that your reset token is valid.'
        );
      }
    } finally {
      setIsLockedSubmitting(false);
    }
  };

  const getInputClass = (hasError: boolean, extra = '') =>
    `w-full h-12 rounded-xl border bg-white dark:bg-slate-900 px-4 text-[15px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
      hasError
        ? 'border-rose-300 dark:border-rose-800/80 focus:border-rose-500 focus:ring-rose-500/15'
        : 'border-slate-200 dark:border-slate-800 focus:border-slate-900 dark:focus:border-indigo-500 focus:ring-slate-900/10 dark:focus:ring-indigo-500/15'
    } ${extra}`;

  return (
    <div data-testid="reset-password-view">
      <AuthHeader
        title="Reset password"
        subtitle="Choose a strong new password for your OFC360 workspace"
      />

      {resetComplete && (
        <AuthSuccessState
          title="Password Reset Complete"
          message={resetComplete}
          actionLabel="Continue to Sign In →"
          onAction={() => onNavigate('login')}
          testId="reset-password-success"
        />
      )}

      <AuthErrorMessage
        message={serverError}
        testId="reset-password-error"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="relative">
          <label
            htmlFor="reset-token"
            className="block text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-2"
          >
            Verification token
          </label>
          <input
            id="reset-token"
            type="text"
            disabled={isBusy}
            aria-invalid={Boolean(errors.token)}
            placeholder="Paste reset token"
            className={getInputClass(Boolean(errors.token), 'font-mono text-sm')}
            {...register('token')}
          />
          <FieldFeedbackMessage
            id="reset-token-error"
            error={errors.token?.message}
          />
        </div>

        <div className="space-y-2">
          <div className="relative">
            <label
              htmlFor="reset-new-password"
              className="block text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-2"
            >
              New password
            </label>
            <div className="relative">
              <input
                id="reset-new-password"
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                disabled={isBusy}
                aria-invalid={Boolean(errors.new_password)}
                placeholder="••••••••••••"
                className={getInputClass(Boolean(errors.new_password), 'pr-11')}
                {...register('new_password', {
                  onChange: () => {
                    if (dirtyFields.confirm_password) {
                      void trigger('confirm_password');
                    }
                  },
                })}
              />
              <button
                type="button"
                disabled={isBusy}
                onClick={() => setShowNewPassword((v) => !v)}
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4.5 h-4.5" />
                ) : (
                  <Eye className="w-4.5 h-4.5" />
                )}
              </button>
            </div>
            <FieldFeedbackMessage
              id="reset-new-password-error"
              error={errors.new_password?.message}
            />
          </div>
        </div>

        <div className="relative">
          <label
            htmlFor="reset-confirm-password"
            className="block text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-2"
          >
            Confirm password
          </label>
          <div className="relative">
            <input
              id="reset-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              disabled={isBusy}
              aria-invalid={Boolean(errors.confirm_password)}
              placeholder="••••••••••••"
              className={getInputClass(Boolean(errors.confirm_password), 'pr-11')}
              {...register('confirm_password')}
            />
            <button
              type="button"
              disabled={isBusy}
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={
                showConfirmPassword
                  ? 'Hide confirm password'
                  : 'Show confirm password'
              }
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4.5 h-4.5" />
              ) : (
                <Eye className="w-4.5 h-4.5" />
              )}
            </button>
          </div>
          <FieldFeedbackMessage
            id="reset-confirm-password-error"
            error={errors.confirm_password?.message}
          />
        </div>

        <div className="pt-1">
          <AuthSubmitButton
            isLoading={isBusy}
            loadingText="Resetting password..."
            data-testid="reset-submit-button"
          >
            Reset password
          </AuthSubmitButton>
        </div>
      </form>
    </div>
  );
}
