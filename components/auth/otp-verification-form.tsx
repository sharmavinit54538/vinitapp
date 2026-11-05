'use client';

import React, { useState, useEffect, useRef } from 'react';
import { authClient, AuthApiError, Ofc360User } from '@/lib/auth-api';
import { otpSchema } from '@/lib/auth-schemas';
import {
  AegisAuthView,
  AuthHeader,
  AuthInput,
  OTPInput,
  AuthSubmitButton,
  AuthErrorMessage,
  AuthSuccessState,
} from './shared';

interface OtpVerificationFormProps {
  email: string;
  onEmailChange: (identifier: string) => void;
  onNavigate: (view: AegisAuthView, identifier?: string) => void;
  onAuthSuccess: (user: Ofc360User) => void;
}

export function OtpVerificationForm({
  email,
  onEmailChange,
  onNavigate,
  onAuthSuccess,
}: OtpVerificationFormProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [secondsLeft, setSecondsLeft] = useState<number>(50);
  const [editingTarget, setEditingTarget] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inFlightRef = useRef(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const combinedOtp = digits.join('');
  const displayEmail = email.trim() || 'hradmin@ofc360.com';

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inFlightRef.current || isSubmitting) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (secondsLeft <= 0) {
      setErrorMsg(
        'This verification code has expired. Please request a new code below.'
      );
      return;
    }

    const parsed = otpSchema.safeParse({
      identifier: displayEmail,
      otp: combinedOtp,
    });

    if (!parsed.success) {
      setErrorMsg(
        parsed.error.issues[0]?.message || 'Enter all 6 verification digits'
      );
      return;
    }

    inFlightRef.current = true;
    setIsSubmitting(true);
    try {
      const target = displayEmail;
      const isPhone = target.startsWith('+') || /^[0-9]+$/.test(target);
      const res = await authClient.verifyOtp({
        ...(isPhone ? { phone: target } : { email: target }),
        otp: combinedOtp,
      });
      setSuccessMsg(
        res.message || 'Identity verified. Loading your workspace...'
      );
      const profile = await authClient.getMe();
      onAuthSuccess(profile);
    } catch (err) {
      if (err instanceof AuthApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg(
          err instanceof Error
            ? err.message
            : 'OTP verification failed. Please check the 6-digit code.'
        );
      }
    } finally {
      inFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsResending(true);

    try {
      await authClient.verifyEmail({
        email: displayEmail,
      });
      setSecondsLeft(50);
      setDigits(['', '', '', '', '', '']);
      setSuccessMsg(
        'A fresh 6-digit verification code has been sent to your email.'
      );
    } catch (err) {
      setSecondsLeft(50);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Could not resend verification code at this moment.'
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div data-testid="otp-verification-view" className="text-center">
      {/* Official OFC360 Logo + Centered Title & Subtitle */}
      <AuthHeader
        centered
        title="Verify your email"
        subtitle="We’ve sent a 6-digit verification code to your registered email address."
      />

      {/* Centered Email + Change email link row */}
      <div className="my-5 flex items-center justify-center gap-6 text-[13.5px]">
        <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[230px]">
          {displayEmail}
        </span>
        <button
          type="button"
          onClick={() => setEditingTarget((prev) => !prev)}
          className="font-medium text-[#4F46E5] dark:text-indigo-400 hover:underline shrink-0 cursor-pointer"
        >
          {editingTarget ? 'Done' : 'Change email'}
        </button>
      </div>

      {editingTarget && (
        <div className="mb-5 text-left max-w-[310px] mx-auto">
          <AuthInput
            id="otp-identifier-input"
            label="Registered email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="hradmin@ofc360.com"
          />
        </div>
      )}

      {successMsg && (
        <div className="text-left max-w-[330px] mx-auto">
          <AuthSuccessState
            title="Verification Update"
            message={successMsg}
            testId="otp-success-banner"
          />
        </div>
      )}

      <div className="text-left max-w-[330px] mx-auto">
        <AuthErrorMessage message={errorMsg} testId="otp-error-alert" />
      </div>

      <form onSubmit={handleVerifyOtp} className="space-y-6" noValidate>
        <OTPInput
          value={digits}
          disabled={isSubmitting}
          onChange={(next) => {
            setErrorMsg(null);
            setDigits(next);
          }}
        />

        <AuthSubmitButton
          isLoading={isSubmitting}
          loadingText="Verifying..."
          data-testid="otp-submit-button"
          className="w-full max-w-[310px] h-10 rounded-[10px] text-[13.5px]"
        >
          Continue
        </AuthSubmitButton>
      </form>

      {/* Resend code + countdown timer row */}
      <div className="mt-5 text-[13px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 flex-wrap">
        <span>Didn’t receive a code?</span>
        <button
          type="button"
          disabled={isResending}
          onClick={handleResendOtp}
          className="font-medium text-[#4F46E5] dark:text-indigo-400 hover:underline cursor-pointer disabled:opacity-60"
        >
          {isResending ? 'Resending...' : 'Resend code'}
        </button>
        <span>
          in{' '}
          <span
            data-testid="otp-expiry-timer"
            className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums"
          >
            {formatTimer(secondsLeft)}
          </span>
        </span>
      </div>

      {/* Back to login link */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => onNavigate('login', email)}
          className="text-[13px] font-medium text-[#4F46E5] dark:text-indigo-400 hover:underline cursor-pointer"
        >
          Back to login
        </button>
      </div>
    </div>
  );
}

