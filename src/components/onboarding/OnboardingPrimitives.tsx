'use client';

import React from 'react';
import {
  AlertTriangle,
  Lock,
  RefreshCw,
  FolderOpen,
  X,
} from 'lucide-react';
import { OnboardingApiError } from '../../services/onboarding/client';

export function OnboardingSkeletonBlock({ rows = 4 }: { rows?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading onboarding data"
      className="space-y-3 rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse"
    >
      <div className="h-5 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800/80"
          />
        ))}
      </div>
      <div className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800/70" />
    </div>
  );
}

export function OnboardingPermissionDeniedState({
  moduleTitle,
  moduleName,
  requiredRoles,
  role,
}: {
  moduleTitle?: string;
  moduleName?: string;
  requiredRoles?: string;
  role?: string;
}) {
  const resolvedTitle = moduleTitle || moduleName || 'Onboarding Module';
  const resolvedRoles = requiredRoles || (role ? `Not permitted for ${role}` : 'Authorized HR/Admin Role');
  return (
    <div
      role="alert"
      className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 flex flex-col items-center text-center gap-3"
    >
      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
        <Lock className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Permission Denied — {resolvedTitle}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
          Your active role does not have RBAC privileges for this Onboarding module.
          Required role(s): <span className="font-semibold">{resolvedRoles}</span>.
        </p>
      </div>
    </div>
  );
}

export function OnboardingErrorState({
  title,
  error,
  message,
  onRetry,
  actionLabel,
  onAction,
}: {
  title?: string;
  error?: OnboardingApiError | Error | null;
  message?: string;
  onRetry: () => void;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const statusBadge =
    error instanceof OnboardingApiError && error.status > 0
      ? `HTTP ${error.status}`
      : 'API OFFLINE';

  const resolvedTitle = title || 'Onboarding API Request Failed';
  const resolvedMessage =
    message ||
    error?.message ||
    'Unable to reach the Onboarding REST API endpoint.';

  return (
    <div
      role="alert"
      className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-rose-200/90 dark:border-rose-900/50 space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {resolvedTitle}
              </h3>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
                {statusBadge}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {resolvedMessage}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onRetry}
          className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry API Request</span>
        </button>
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function OnboardingEmptyState({
  icon: IconComp,
  title,
  description,
  ctaLabel,
  onCtaClick,
  actionLabel,
  onAction,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const ResolvedIcon = IconComp || FolderOpen;
  const resolvedLabel = ctaLabel || actionLabel;
  const resolvedHandler = onCtaClick || onAction;

  return (
    <div className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center gap-3">
      <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
        <ResolvedIcon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
          {description}
        </p>
      </div>
      {resolvedLabel && resolvedHandler ? (
        <button
          type="button"
          onClick={resolvedHandler}
          className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
        >
          {resolvedLabel}
        </button>
      ) : null}
    </div>
  );
}

export function OnboardingModal({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            {subtitle ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
