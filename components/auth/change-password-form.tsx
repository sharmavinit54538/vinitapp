'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  changePasswordSchema,
  ChangePasswordFormValues,
} from '@/lib/auth-schemas';
import { authClient, AuthApiError } from '@/lib/auth-api';
import {
  AegisAuthView,
  AuthHeader,
  PasswordInput,
  AuthSubmitButton,
  AuthErrorMessage,
  AuthSuccessState,
  AuthFooter,
} from './shared';
import { Lock } from 'lucide-react';

interface ChangePasswordFormProps {
  onNavigate: (view: AegisAuthView) => void;
}

export function ChangePasswordForm({ onNavigate }: ChangePasswordFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setServerError(null);
    setSuccessMsg(null);

    try {
      const res = await authClient.changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      });
      setSuccessMsg(res.message);
      reset();
    } catch (err) {
      if (err instanceof AuthApiError) {
        setServerError(err.message);
      } else {
        setServerError(
          err instanceof Error
            ? err.message
            : 'Unable to update password right now.'
        );
      }
    }
  };

  return (
    <div data-testid="change-password-view">
      <AuthHeader
        icon={<Lock className="w-5 h-5" />}
        title="Change Password"
        subtitle="Update your current workspace password with a new security credential."
      />

      {successMsg && (
        <AuthSuccessState
          title="Password Updated"
          message={successMsg}
          actionLabel="Return to Login →"
          onAction={() => onNavigate('login')}
          testId="change-password-success"
        />
      )}

      <AuthErrorMessage
        message={serverError}
        testId="change-password-error"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <PasswordInput
          id="change-current-password"
          label="Current Password"
          autoComplete="current-password"
          placeholder="Enter current password"
          error={errors.current_password?.message}
          {...register('current_password')}
        />

        <div className="space-y-1.5">
          <PasswordInput
            id="change-new-password"
            label="New Password"
            autoComplete="new-password"
            placeholder="Enter strong new password"
            error={errors.new_password?.message}
            {...register('new_password')}
          />
        </div>

        <PasswordInput
          id="change-confirm-password"
          label="Confirm New Password"
          autoComplete="new-password"
          placeholder="Confirm new password"
          error={errors.confirm_password?.message}
          {...register('confirm_password')}
        />

        <AuthSubmitButton
          isLoading={isSubmitting}
          loadingText="Updating Password..."
        >
          Update Password
        </AuthSubmitButton>
      </form>

      <AuthFooter
        promptText="Forgot your current password?"
        actionLabel="Reset via Email"
        onAction={() => onNavigate('forgot-password')}
      />
    </div>
  );
}
