'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  workspaceRegisterSchema,
  WorkspaceRegisterFormValues,
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
import { Eye, EyeOff, Check } from 'lucide-react';

interface RegisterFormProps {
  onNavigate: (view: AegisAuthView, identifier?: string) => void;
  initialEmail?: string;
}

export function RegisterForm({
  onNavigate,
  initialEmail = '',
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLockedSubmitting, setIsLockedSubmitting] = useState(false);
  const inFlightRef = useRef(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<{
    email: string;
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<WorkspaceRegisterFormValues>({
    resolver: zodResolver(workspaceRegisterSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      company_name: '',
      first_name: '',
      last_name: '',
      email: initialEmail,
      phone: '',
      password: '',
      confirm_password: '',
      accept_terms: true,
    },
  });

  const isBusy = isSubmitting || isLockedSubmitting;
  const acceptTerms = watch('accept_terms');

  const onSubmit = async (values: WorkspaceRegisterFormValues) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsLockedSubmitting(true);
    setServerError(null);
    setRegistrationSuccess(null);

    const fullName = `${values.first_name.trim()} ${values.last_name.trim()}`.trim();

    try {
      const res = await authClient.register({
        full_name: fullName,
        email: values.email.trim(),
        phone: values.phone.trim(),
        company_name: values.company_name.trim(),
        password: values.password,
        confirm_password: values.confirm_password,
      });

      setRegistrationSuccess({
        email: values.email.trim(),
        message:
          res.message ||
          'Workspace created. Please verify your email or 6-digit OTP to continue.',
      });
    } catch (err) {
      if (err instanceof AuthApiError) {
        setServerError(err.message);
      } else {
        setServerError(
          err instanceof Error
            ? err.message
            : 'Workspace creation could not be completed. Please try again.'
        );
      }
    } finally {
      inFlightRef.current = false;
      setIsLockedSubmitting(false);
    }
  };

  const getInputClass = (hasError: boolean, extra = '') =>
    `w-full h-11 rounded-xl border bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
      hasError
        ? 'border-rose-300 dark:border-rose-800/80 focus:border-rose-500 focus:ring-rose-500/15'
        : 'border-slate-200 dark:border-slate-800 focus:border-slate-900 dark:focus:border-indigo-500 focus:ring-slate-900/10 dark:focus:ring-indigo-500/15'
    } ${extra}`;

  const labelBaseClass =
    'block text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5';

  return (
    <div data-testid="register-view">
      <AuthHeader
        title="Create your workspace"
        subtitle="Deploy your enterprise workspace in seconds."
      />

      {registrationSuccess && (
        <AuthSuccessState
          title="Workspace Created"
          message={registrationSuccess.message}
          actionLabel="Verify 6-Digit OTP →"
          onAction={() => onNavigate('verify-otp', registrationSuccess.email)}
          secondaryActionLabel="Verify Email"
          onSecondaryAction={() =>
            onNavigate('verify-email', registrationSuccess.email)
          }
          testId="register-success-banner"
        />
      )}

      <AuthErrorMessage message={serverError} testId="register-error-alert" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        {/* Row 1: Company or organization name */}
        <div className="relative">
          <label htmlFor="reg-company" className={labelBaseClass}>
            Company or organization name
          </label>
          <input
            id="reg-company"
            type="text"
            autoComplete="organization"
            disabled={isBusy}
            aria-invalid={Boolean(errors.company_name)}
            aria-describedby={
              errors.company_name ? 'reg-company-error' : undefined
            }
            placeholder="Acme Global Inc."
            className={getInputClass(Boolean(errors.company_name))}
            {...register('company_name')}
          />
          <FieldFeedbackMessage
            id="reg-company-error"
            error={errors.company_name?.message}
          />
        </div>

        {/* Row 2: First name & Last name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label htmlFor="reg-first-name" className={labelBaseClass}>
              First name
            </label>
            <input
              id="reg-first-name"
              type="text"
              autoComplete="given-name"
              disabled={isBusy}
              aria-invalid={Boolean(errors.first_name)}
              aria-describedby={
                errors.first_name ? 'reg-first-name-error' : undefined
              }
              placeholder="John"
              className={getInputClass(Boolean(errors.first_name))}
              {...register('first_name')}
            />
            <FieldFeedbackMessage
              id="reg-first-name-error"
              error={errors.first_name?.message}
            />
          </div>

          <div className="relative">
            <label htmlFor="reg-last-name" className={labelBaseClass}>
              Last name
            </label>
            <input
              id="reg-last-name"
              type="text"
              autoComplete="family-name"
              disabled={isBusy}
              aria-invalid={Boolean(errors.last_name)}
              aria-describedby={
                errors.last_name ? 'reg-last-name-error' : undefined
              }
              placeholder="Doe"
              className={getInputClass(Boolean(errors.last_name))}
              {...register('last_name')}
            />
            <FieldFeedbackMessage
              id="reg-last-name-error"
              error={errors.last_name?.message}
            />
          </div>
        </div>

        {/* Row 3: Work email & Mobile number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label htmlFor="reg-email" className={labelBaseClass}>
              Work email
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              disabled={isBusy}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'reg-email-error' : undefined}
              placeholder="admin@company.com"
              className={getInputClass(Boolean(errors.email))}
              {...register('email')}
            />
            <FieldFeedbackMessage
              id="reg-email-error"
              error={errors.email?.message}
            />
          </div>

          <div className="relative">
            <label htmlFor="reg-phone" className={labelBaseClass}>
              Mobile number
            </label>
            <input
              id="reg-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              disabled={isBusy}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'reg-phone-error' : undefined}
              placeholder="+91 98765 43210"
              className={getInputClass(Boolean(errors.phone))}
              {...register('phone')}
            />
            <FieldFeedbackMessage
              id="reg-phone-error"
              error={errors.phone?.message}
            />
          </div>
        </div>

        {/* Row 4: Password & Confirm password + Real-Time Password Strength Meter */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="reg-password" className={labelBaseClass}>
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isBusy}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? 'reg-password-error' : undefined
                  }
                  placeholder="••••••••••••"
                  className={getInputClass(Boolean(errors.password), 'pr-10')}
                  {...register('password', {
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
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <FieldFeedbackMessage
                id="reg-password-error"
                error={errors.password?.message}
              />
            </div>

            <div className="relative">
              <label htmlFor="reg-confirm-password" className={labelBaseClass}>
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isBusy}
                  aria-invalid={Boolean(errors.confirm_password)}
                  aria-describedby={
                    errors.confirm_password ? 'reg-confirm-error' : undefined
                  }
                  placeholder="••••••••••••"
                  className={getInputClass(
                    Boolean(errors.confirm_password),
                    'pr-10'
                  )}
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <FieldFeedbackMessage
                id="reg-confirm-error"
                error={errors.confirm_password?.message}
              />
            </div>
          </div>
        </div>

        {/* Row 5: Circular Terms of Service & Privacy Policy Checkbox */}
        <div className="relative pt-1">
          <label
            htmlFor="reg-accept-terms"
            className="inline-flex items-center gap-2.5 text-[13px] text-slate-600 dark:text-slate-400 cursor-pointer select-none"
          >
            <input
              id="reg-accept-terms"
              type="checkbox"
              disabled={isBusy}
              className="sr-only"
              checked={Boolean(acceptTerms)}
              onChange={(e) =>
                setValue('accept_terms', e.target.checked, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            />
            <span
              aria-hidden="true"
              className={`w-[18px] h-[18px] rounded-full flex items-center justify-center border transition-all shrink-0 ${
                acceptTerms
                  ? 'bg-[#0B1120] border-[#0B1120] text-white dark:bg-indigo-600 dark:border-indigo-600'
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'
              }`}
            >
              {acceptTerms && <Check className="w-3 h-3 stroke-[3]" />}
            </span>
            <span>
              I agree to the OFC360{' '}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Terms of Service
              </span>{' '}
              and{' '}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Privacy Policy
              </span>
              .
            </span>
          </label>
          <FieldFeedbackMessage
            id="reg-terms-error"
            error={errors.accept_terms?.message}
            floating={false}
          />
        </div>

        {/* Row 6: Full-width dark 'Create workspace' button */}
        <div className="pt-1.5">
          <AuthSubmitButton
            isLoading={isBusy}
            loadingText="Creating workspace..."
            data-testid="register-submit-button"
          >
            Create workspace
          </AuthSubmitButton>
        </div>
      </form>
    </div>
  );
}
