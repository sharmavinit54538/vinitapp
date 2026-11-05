'use client';

import React, { useState, useRef } from 'react';
import { authClient, AuthApiError, Ofc360User } from '@/lib/auth-api';
import { mfaVerifySchema } from '@/lib/auth-schemas';
import { Label } from '@/components/ui/label';
import {
  AegisAuthView,
  AuthHeader,
  AuthInput,
  OTPInput,
  AuthSubmitButton,
  AuthErrorMessage,
  AuthSuccessState,
  AuthFooter,
} from './shared';
import { KeyRound, Smartphone, ShieldAlert } from 'lucide-react';

interface MfaVerificationFormProps {
  identifier?: string;
  onNavigate: (view: AegisAuthView, identifier?: string) => void;
  onAuthSuccess: (user: Ofc360User) => void;
}

export function MfaVerificationForm({
  identifier = '',
  onNavigate,
  onAuthSuccess,
}: MfaVerificationFormProps) {
  const [mfaMode, setMfaMode] = useState<'totp' | 'recovery'>('totp');
  const [totpDigits, setTotpDigits] = useState<string[]>([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);
  const [recoveryCode, setRecoveryCode] = useState<string>('');
  const [trustDevice, setTrustDevice] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const inFlightRef = useRef(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmitMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inFlightRef.current || isSubmitting) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    const codeValue =
      mfaMode === 'totp' ? totpDigits.join('') : recoveryCode.trim();

    const parsed = mfaVerifySchema.safeParse({
      mode: mfaMode,
      code: codeValue,
      trust_device: trustDevice,
    });

    if (!parsed.success) {
      setErrorMsg(
        parsed.error.issues[0]?.message ||
          'Enter a valid 6-digit authenticator code or recovery key'
      );
      return;
    }

    inFlightRef.current = true;
    setIsSubmitting(true);
    try {
      const res = await authClient.verifyMfa({
        code: codeValue,
        mode: mfaMode,
        trust_device: trustDevice,
        email: identifier || undefined,
      });
      setSuccessMsg(res.message || 'MFA challenge verified.');
      const profile = await authClient.getMe();
      onAuthSuccess(profile);
    } catch (err) {
      if (err instanceof AuthApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg(
          err instanceof Error
            ? err.message
            : 'Authenticator verification failed. Please check your code.'
        );
      }
    } finally {
      inFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div data-testid="mfa-verification-view">
      <AuthHeader
        icon={<ShieldAlert className="w-5 h-5" />}
        title="Multi-Factor Authentication"
        subtitle={
          mfaMode === 'totp'
            ? 'Open your authenticator app (1Password, Google Authenticator, or Authy) and enter the 6-digit TOTP code.'
            : 'Enter one of your single-use OFC360 backup recovery codes.'
        }
        badgeText="2FA / TOTP"
      />

      {successMsg && (
        <AuthSuccessState
          title="MFA Verified"
          message={successMsg}
          testId="mfa-success-banner"
        />
      )}

      <AuthErrorMessage message={errorMsg} testId="mfa-error-alert" />

      <form onSubmit={handleSubmitMfa} className="space-y-5" noValidate>
        {mfaMode === 'totp' ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <Label htmlFor="mfa-totp-0">Authenticator App Code</Label>
              <span className="font-mono text-[11px] text-slate-400">
                6-Digit TOTP
              </span>
            </div>
            <OTPInput
              idPrefix="mfa-totp"
              value={totpDigits}
              onChange={(next) => {
                setErrorMsg(null);
                setTotpDigits(next);
              }}
            />
          </div>
        ) : (
          <AuthInput
            id="mfa-recovery-input"
            label="Backup Recovery Code"
            type="text"
            mono
            placeholder="OFC360-XXXX-XXXX"
            icon={<KeyRound className="w-4 h-4" />}
            value={recoveryCode}
            onChange={(e) => {
              setErrorMsg(null);
              setRecoveryCode(e.target.value.toUpperCase());
            }}
          />
        )}

        {/* Trust this device checkbox */}
        <div className="flex items-center justify-between pt-0.5">
          <label
            htmlFor="mfa-trust-device"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none"
          >
            <input
              id="mfa-trust-device"
              type="checkbox"
              checked={trustDevice}
              onChange={(e) => setTrustDevice(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Trust this device for 30 days</span>
          </label>

          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              setMfaMode((m) => (m === 'totp' ? 'recovery' : 'totp'));
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            {mfaMode === 'totp' ? (
              <>
                <KeyRound className="w-3.5 h-3.5" />
                <span>Use recovery code</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>Use authenticator app</span>
              </>
            )}
          </button>
        </div>

        <AuthSubmitButton
          isLoading={isSubmitting}
          loadingText="Verifying MFA..."
        >
          Verify
        </AuthSubmitButton>
      </form>

      <AuthFooter
        promptText="Having trouble with 2FA?"
        actionLabel="Back to Login"
        onAction={() => onNavigate('login', identifier)}
      />
    </div>
  );
}
