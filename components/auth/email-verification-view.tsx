'use client';

import React, { useState, useEffect } from 'react';
import { authClient, AuthApiError } from '@/lib/auth-api';
import { Button } from '@/components/ui/button';
import {
  AegisAuthView,
  AuthHeader,
  AuthInput,
  AuthSubmitButton,
  AuthFooter,
} from './shared';
import {
  Mail,
  KeyRound,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  MailCheck,
  UserCheck,
  RefreshCw,
} from 'lucide-react';

export type VerificationLifecycleState =
  | 'pending'
  | 'verified'
  | 'expired'
  | 'failed';

export type VerificationFlowType =
  | 'verify-email'
  | 'activate-account';

interface EmailVerificationViewProps {
  email: string;
  onEmailChange: (email: string) => void;
  onNavigate: (view: AegisAuthView, email?: string) => void;
  initialToken?: string;
  initialFlow?: VerificationFlowType;
}

export function EmailVerificationView({
  email,
  onEmailChange,
  onNavigate,
  initialToken = '',
  initialFlow = 'verify-email',
}: EmailVerificationViewProps) {
  const [flowType, setFlowType] = useState<VerificationFlowType>(initialFlow);
  const [verificationState, setVerificationState] =
    useState<VerificationLifecycleState>('pending');
  const [token, setToken] = useState<string>(initialToken);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [customStatusMsg, setCustomStatusMsg] = useState<string | null>(null);

  const isActivation = flowType === 'activate-account';

  const stateDescriptors: Record<
    VerificationLifecycleState,
    {
      title: string;
      description: string;
      borderClass: string;
      bgClass: string;
      icon: React.ReactNode;
    }
  > = {
    pending: {
      title: isActivation
        ? 'Account Activation Pending'
        : 'Verification Pending',
      description: isActivation
        ? 'Your enterprise account is awaiting activation. Submit your activation token or work email below.'
        : 'We sent a verification link to your work email address. Click the link or enter your verification token below.',
      borderClass: 'border-indigo-200/80 dark:border-indigo-900/60',
      bgClass: 'bg-indigo-50/50 dark:bg-indigo-950/30',
      icon: (
        <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
      ),
    },
    verified: {
      title: isActivation
        ? 'Account Activated'
        : 'Email Verified Successfully',
      description: isActivation
        ? 'Your OFC360 enterprise account is now active and ready for sign-in.'
        : 'Your work email address has been verified. You have full access to your workspace.',
      borderClass: 'border-emerald-200/90 dark:border-emerald-900/60',
      bgClass: 'bg-emerald-50/70 dark:bg-emerald-950/35',
      icon: (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      ),
    },
    expired: {
      title: isActivation
        ? 'Activation Link Expired'
        : 'Verification Link Expired',
      description: isActivation
        ? 'This account activation link has expired for security reasons. Request a fresh activation link below.'
        : 'Your email verification link has passed its validity window. Request a new verification email below.',
      borderClass: 'border-amber-200/90 dark:border-amber-900/60',
      bgClass: 'bg-amber-50/70 dark:bg-amber-950/35',
      icon: (
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
      ),
    },
    failed: {
      title: isActivation ? 'Activation Failed' : 'Verification Failed',
      description: isActivation
        ? 'We could not validate your account activation request. Please check your token or retry.'
        : 'We could not verify your email with the provided token. Please check the token and try again.',
      borderClass: 'border-rose-200/90 dark:border-rose-900/60',
      bgClass: 'bg-rose-50/70 dark:bg-rose-950/35',
      icon: (
        <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
      ),
    },
  };

  const activeBanner = stateDescriptors[verificationState];

  const handleExecuteVerification = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!token.trim() && !email.trim()) {
      setVerificationState('failed');
      setCustomStatusMsg(
        'Please provide your work email address or verification token.'
      );
      return;
    }

    setIsSubmitting(true);
    setCustomStatusMsg(null);
    try {
      if (isActivation) {
        const res = await authClient.activateAccount({
          token: token.trim() || undefined,
          email: email.trim() || undefined,
        });
        setVerificationState('verified');
        setCustomStatusMsg(res.message);
      } else {
        const res = await authClient.verifyEmail({
          token: token.trim() || undefined,
          email: email.trim() || undefined,
        });
        setVerificationState('verified');
        setCustomStatusMsg(res.message);
      }
    } catch (err) {
      if (err instanceof AuthApiError) {
        const lower = err.message.toLowerCase();
        if (lower.includes('expired')) {
          setVerificationState('expired');
        } else {
          setVerificationState('failed');
        }
        setCustomStatusMsg(err.message);
      } else {
        setVerificationState('failed');
        setCustomStatusMsg(
          err instanceof Error
            ? err.message
            : 'Request could not be completed.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid={
        isActivation ? 'account-activation-view' : 'email-verification-view'
      }
    >
      <AuthHeader
        icon={
          isActivation ? (
            <UserCheck className="w-5 h-5" />
          ) : (
            <MailCheck className="w-5 h-5" />
          )
        }
        title={isActivation ? 'Account Activation' : 'Email Verification'}
        subtitle={
          isActivation
            ? 'Activate your enterprise account to unlock your workspace.'
            : 'Verify your work email address to secure your OFC360 identity.'
        }
      />

      {/* Interactive Status Card showing Pending / Verified / Expired / Failed */}
      <div
        role="status"
        data-testid={`verification-state-${verificationState}`}
        className={`rounded-xl border ${activeBanner.borderClass} ${activeBanner.bgClass} p-4 space-y-3 mb-5`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{activeBanner.icon}</div>
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-slate-900 dark:text-white">
              {activeBanner.title}
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {customStatusMsg || activeBanner.description}
            </p>
          </div>
        </div>

        {/* Status Preview Bar for inspecting all 4 required states */}
        <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            State:
          </span>
          <div className="flex items-center gap-1">
            {(
              [
                'pending',
                'verified',
                'expired',
                'failed',
              ] as VerificationLifecycleState[]
            ).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setVerificationState(st);
                  setCustomStatusMsg(null);
                }}
                className={`px-2 py-0.5 rounded font-mono uppercase transition-colors cursor-pointer ${
                  verificationState === st
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-white/80 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form
        onSubmit={handleExecuteVerification}
        className="space-y-4"
        noValidate
      >
        <AuthInput
          id="verify-email-input"
          label="Work Email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="name@company.com"
          icon={<Mail className="w-4 h-4" />}
        />

        <AuthInput
          id="verify-token-input"
          label={isActivation ? 'Activation Token' : 'Verification Token'}
          type="text"
          mono
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder={
            isActivation
              ? 'Paste activation token'
              : 'Paste email verification token'
          }
          icon={<KeyRound className="w-4 h-4" />}
        />

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <AuthSubmitButton
            isLoading={isSubmitting}
            loadingText={
              isActivation ? 'Activating Account...' : 'Verifying Email...'
            }
            className="flex-1"
          >
            {isActivation ? 'Activate Account' : 'Verify Email'}
          </AuthSubmitButton>

          {verificationState !== 'verified' && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isSubmitting}
              onClick={() => handleExecuteVerification()}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry / Resend</span>
            </Button>
          )}
        </div>
      </form>

      <AuthFooter
        secondaryLabel={
          isActivation ? 'Need email verification?' : 'Need account activation?'
        }
        onSecondaryAction={() =>
          onNavigate(
            isActivation ? 'verify-email' : 'activate-account',
            email
          )
        }
        actionLabel="Back to Login"
        onAction={() => onNavigate('login', email)}
      />
    </div>
  );
}
