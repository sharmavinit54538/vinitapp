'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  Inbox,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Lock,
  Plus,
} from 'lucide-react';
import { maskSensitiveField } from '../../services/payroll/client';
import { compensationService } from '../../services/payroll';

export function PayrollLoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading payroll data from server"
      className="space-y-4 animate-pulse"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3"
          >
            <div className="h-3.5 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-7 w-36 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-20 rounded-lg bg-slate-100 dark:bg-slate-800/70" />
          </div>
        ))}
      </div>
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-12 w-full rounded-2xl bg-slate-100 dark:bg-slate-800/60"
          />
        ))}
      </div>
    </div>
  );
}

export function PayrollEmptyState({
  title,
  description,
  ctaLabel,
  onAction,
  canAction = true,
}: {
  title: string;
  description: string;
  ctaLabel?: string;
  onAction?: () => void;
  canAction?: boolean;
}) {
  return (
    <div className="rounded-3xl p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center max-w-xl mx-auto my-4">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
        <Inbox className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-md">
        {description}
      </p>
      {ctaLabel && onAction && canAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 h-12 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 inline-flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>{ctaLabel}</span>
        </button>
      ) : null}
    </div>
  );
}

export function PayrollErrorState({
  title = 'Unable to Load Payroll Data',
  message,
  statusCode,
  onRetry,
  primaryActionLabel,
  onPrimaryAction,
}: {
  title?: string;
  message: string;
  statusCode?: number;
  onRetry: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/50 space-y-4"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            {statusCode ? (
              <span className="text-[11px] font-mono font-semibold text-rose-600 dark:text-rose-400">
                HTTP {statusCode}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap pt-1">
        <button
          type="button"
          onClick={onRetry}
          className="h-11 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold inline-flex items-center gap-2 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry API Request</span>
        </button>
        {primaryActionLabel && onPrimaryAction ? (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="h-11 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 inline-flex items-center gap-2 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{primaryActionLabel}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function PayrollPermissionDenied({
  moduleTitle,
  requiredPermission,
  currentRole,
}: {
  moduleTitle: string;
  requiredPermission: string;
  currentRole: string;
}) {
  return (
    <div
      role="alert"
      className="rounded-3xl p-8 bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/50 flex flex-col items-center text-center max-w-lg mx-auto my-6"
    >
      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        Permission Denied · {moduleTitle}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
        Your active role (<span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{currentRole}</span>) does not have the required{' '}
        <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
          {requiredPermission}
        </span>{' '}
        privilege to view or modify this payroll module.
      </p>
    </div>
  );
}

export function SensitiveFieldCell({
  employeeId,
  field,
  maskedValue,
  canReveal,
  onRevealedToast,
}: {
  employeeId: string;
  field: 'pan' | 'uan' | 'esi' | 'bankAccount';
  maskedValue: string;
  canReveal: boolean;
  onRevealedToast?: (msg: string) => void;
}) {
  const [revealedValue, setRevealedValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleToggleReveal = async () => {
    if (!canReveal) return;
    if (revealedValue) {
      setRevealedValue(null);
      return;
    }
    setLoading(true);
    try {
      const res = await compensationService.revealSensitiveField(employeeId, field);
      setRevealedValue(res.unmaskedValue);
      onRevealedToast?.(`Audit logged: Revealed ${field.toUpperCase()} for ${employeeId}`);
    } catch (err) {
      onRevealedToast?.(
        err instanceof Error ? err.message : `Could not reveal ${field.toUpperCase()}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums text-slate-700 dark:text-slate-300">
      <span>{revealedValue || maskSensitiveField(maskedValue)}</span>
      {canReveal ? (
        <button
          type="button"
          onClick={handleToggleReveal}
          disabled={loading}
          aria-label={revealedValue ? `Hide ${field}` : `Reveal ${field}`}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition"
        >
          {revealedValue ? (
            <EyeOff className="w-3.5 h-3.5" />
          ) : (
            <Eye className="w-3.5 h-3.5" />
          )}
        </button>
      ) : (
        <Lock className="w-3 h-3 text-slate-400" aria-label="Masked field" />
      )}
    </span>
  );
}

export function PayrollPaginationBar({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
}) {
  const safeTotalPages = Math.max(1, totalPages);
  return (
    <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
      <div className="font-mono tabular-nums">
        Page {page} of {safeTotalPages} · {total} total records ({pageSize}/page)
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous Page"
          className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 disabled:opacity-40 inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Prev</span>
        </button>
        <button
          type="button"
          disabled={page >= safeTotalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next Page"
          className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 disabled:opacity-40 inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export function ConfirmDestructiveModal({
  open,
  title,
  description,
  confirmLabel,
  requireReason = true,
  isSubmitting = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  requireReason?: boolean;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requireReason && reason.trim().length < 5) {
      setError('Please enter an audit reason (minimum 5 characters).');
      return;
    }
    setError('');
    onConfirm(reason.trim());
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="destructive-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
      >
        <div className="w-10 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-1" />
        <h3
          id="destructive-modal-title"
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-white"
        >
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>

        {requireReason ? (
          <div className="space-y-1.5">
            <label
              htmlFor="audit-reason-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Mandatory Audit Trail Reason
            </label>
            <textarea
              id="audit-reason-input"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide reason for immutable payroll audit log..."
              className="w-full rounded-2xl p-3 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
            {error ? (
              <p className="text-[11px] font-medium text-rose-600">{error}</p>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-rose-600/20"
          >
            {isSubmitting ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
