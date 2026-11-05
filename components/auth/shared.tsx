'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  COUNTRY_CODES,
  calculatePasswordStrength,
} from '@/lib/auth-schemas';
import {
  Shield,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Check,
  Sun,
  Moon,
  ChevronDown,
  ArrowRight,
  Globe,
  Code2,
} from 'lucide-react';

export type AegisAuthView =
  | 'login'
  | 'register'
  | 'verify-otp'
  | 'mfa-verify'
  | 'forgot-password'
  | 'reset-password'
  | 'verify-email'
  | 'activate-account'
  | 'change-password';

/**
 * 1. AuthLayout
 * Minimal, distraction-free centered layout with full Light & Dark mode support.
 * No admin sidebar, no dashboard navigation, no oversized banners.
 */
export interface AuthLayoutProps {
  children: React.ReactNode;
  activeView?: AegisAuthView;
  onSelectView?: (view: AegisAuthView) => void;
}

/**
 * Crisp Vector OFC360 Squircle Emblem matching the official OFC360 mark
 */
export function Ofc360LogoMark({
  size = 'lg',
}: {
  size?: 'sm' | 'lg';
}) {
  const containerClass =
    size === 'lg'
      ? 'w-[68px] h-[68px] rounded-[18px] bg-[#F8FAFC] dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-[0_4px_14px_rgba(15,23,42,0.06)] flex items-center justify-center'
      : 'w-9 h-9 rounded-[10px] bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex items-center justify-center';

  const svgSize = size === 'lg' ? 48 : 26;

  return (
    <div className={containerClass}>
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="OFC360 Logo"
      >
        <defs>
          <linearGradient
            id="ofc360RingGrad"
            x1="15"
            y1="85"
            x2="88"
            y2="15"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#06152D" />
            <stop offset="55%" stopColor="#0B2B5E" />
            <stop offset="100%" stopColor="#0052FF" />
          </linearGradient>
          <linearGradient
            id="ofc360WingGrad"
            x1="45"
            y1="25"
            x2="95"
            y2="25"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#0A2E6E" />
            <stop offset="100%" stopColor="#0052FF" />
          </linearGradient>
        </defs>

        {/* Outer 'O' Ring with aerodynamic opening on the right */}
        <path
          d="M 63 39 A 24 24 0 1 0 65 62"
          stroke="url(#ofc360RingGrad)"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Upper 'F' Wing extending from top of ring */}
        <path
          d="M 42 20 H 92 L 85 32 H 54 Z"
          fill="url(#ofc360WingGrad)"
        />

        {/* Middle 'F' Wing bar */}
        <path
          d="M 56 43 H 83 L 77 54 H 56 Z"
          fill="url(#ofc360WingGrad)"
        />

        {/* Embedded '360' in the center of the O */}
        <text
          x="41"
          y="55"
          textAnchor="middle"
          fill="currentColor"
          className="text-[#071936] dark:text-white"
          fontFamily="var(--font-sans), sans-serif"
          fontWeight="800"
          fontSize="15.5"
          letterSpacing="-0.5"
        >
          360
        </text>
      </svg>
    </div>
  );
}

export function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-x-hidden transition-colors duration-200">
      {/* Centered Authentication Card Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10 sm:px-6">
        {children}
      </main>
    </div>
  );
}

/**
 * 2. AuthCard
 * Centered card with subtle borders and soft shadows.
 */
export interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AuthCard({ children, className, ...props }: AuthCardProps) {
  return (
    <div
      className={cn(
        'w-full max-w-[440px] rounded-[22px] border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/95 p-7 sm:p-9 shadow-[0_8px_30px_rgb(15,23,42,0.05),0_1px_3px_rgb(15,23,42,0.02)] dark:shadow-[0_12px_40px_rgb(0,0,0,0.45)] transition-colors duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * 3. AuthHeader
 * Displays the centered OFC360 squircle emblem at the top and left-aligned title & subtitle below.
 */
export interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  showBrandMark?: boolean;
  badgeText?: string;
  centered?: boolean;
}

export function AuthHeader({
  title,
  subtitle,
  icon,
  showBrandMark = true,
  badgeText,
  centered = false,
}: AuthHeaderProps) {
  return (
    <div className={cn('mb-6', centered && 'text-center')}>
      {showBrandMark && !icon && (
        <div className="flex justify-center mb-5">
          <Ofc360LogoMark size="lg" />
        </div>
      )}

      {(icon || badgeText) && (
        <div className="flex items-center justify-between mb-4">
          {icon ? (
            <div className="w-10 h-10 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 flex items-center justify-center">
              {icon}
            </div>
          ) : (
            <div />
          )}

          {badgeText && (
            <span className="font-mono text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
              {badgeText}
            </span>
          )}
        </div>
      )}

      <div className={cn('space-y-2', centered && ' flex flex-col items-center')}>
        <h1 className="text-[24px] sm:text-[26px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              'text-sm text-slate-500 dark:text-slate-400 leading-relaxed',
              centered && 'max-w-[330px] mx-auto'
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * 4. AuthInput
 * Reusable labeled input with optional leading icon and validation message.
 */
export interface AuthInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  mono?: boolean;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, icon, rightElement, mono, id, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor={id}>{label}</Label>
          {rightElement}
        </div>
        <div className="relative">
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
              {icon}
            </span>
          )}
          <Input
            id={id}
            ref={ref}
            className={cn(
              icon ? 'pl-10' : '',
              mono ? 'font-mono text-xs' : '',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p role="alert" className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);
AuthInput.displayName = 'AuthInput';

/**
 * 5. PasswordInput
 * Reusable password input with show/hide visibility toggle and optional Forgot link.
 */
export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightLabelAction?: React.ReactNode;
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ label, error, rightLabelAction, id, className, ...props }, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {rightLabelAction}
      </div>
      <div className="relative">
        <Input
          id={id}
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn('pr-10', className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          {visible ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-rose-600 dark:text-rose-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';

/**
 * 6. CountryCodeSelector
 * Dropdown for country dial codes (+1 US default) using JetBrains Mono.
 */
export interface CountryCodeSelectorProps {
  value: string;
  onChange: (code: string) => void;
  id?: string;
}

export function CountryCodeSelector({
  value,
  onChange,
  id = 'country-code-select',
}: CountryCodeSelectorProps) {
  return (
    <div className="relative shrink-0">
      <select
        id={id}
        aria-label="Country code"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 appearance-none rounded-[10px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 pl-3 pr-7 text-xs font-mono font-medium text-slate-800 dark:text-slate-200 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 transition-all cursor-pointer"
      >
        {COUNTRY_CODES.map((c) => (
          <option key={`${c.country}-${c.code}`} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
    </div>
  );
}

/**
 * 7. PhoneInput
 * Combined CountryCodeSelector (+1 US default) and Mobile Number input.
 */
export interface PhoneInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  error?: string;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      label = 'Mobile Number',
      countryCode,
      onCountryCodeChange,
      error,
      id = 'mobile-number-input',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>{label}</Label>
        <div className="flex items-center gap-2">
          <CountryCodeSelector
            value={countryCode}
            onChange={onCountryCodeChange}
            id={`${id}-country`}
          />
          <Input
            id={id}
            ref={ref}
            type="tel"
            inputMode="tel"
            placeholder="(555) 234-5678"
            className={cn('font-mono text-sm', className)}
            {...props}
          />
        </div>
        {error && (
          <p role="alert" className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);
PhoneInput.displayName = 'PhoneInput';

/**
 * 8. OTPInput
 * Six individual OTP input boxes with auto-focus, Backspace navigation, and full 6-digit paste support.
 */
export interface OTPInputProps {
  value: string[];
  onChange: (digits: string[]) => void;
  disabled?: boolean;
  idPrefix?: string;
  autoFocus?: boolean;
}

export function OTPInput({
  value,
  onChange,
  disabled = false,
  idPrefix = 'otp-digit',
  autoFocus = true,
}: OTPInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus && !disabled) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus, disabled]);

  const handleDigitChange = (index: number, rawValue: string) => {
    const cleanDigit = rawValue.replace(/[^0-9]/g, '').slice(-1);
    const next = [...value];
    next[index] = cleanDigit;
    onChange(next);

    if (cleanDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/[^0-9]/g, '')
      .slice(0, 6);
    if (!pasted) return;
    const next = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    onChange(next);
    const focusIndex = Math.min(5, pasted.length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-2.5">
      {value.map((digit, idx) => (
        <input
          key={idx}
          id={`${idPrefix}-${idx}`}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={digit}
          onChange={(e) => handleDigitChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          aria-label={`Verification digit ${idx + 1}`}
          className="w-11 h-12 sm:w-[46px] sm:h-[50px] rounded-[12px] border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 text-center text-base sm:text-lg font-semibold tabular-nums text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-indigo-400 focus:ring-1 focus:ring-slate-900 dark:focus:ring-indigo-400 transition-all disabled:opacity-50"
        />
      ))}
    </div>
  );
}

/**
 * 9. PasswordStrength
 * 4-bar visual password strength indicator (meter) and real-time enterprise security complexity checklist.
 */
export interface PasswordStrengthProps {
  password: string;
  compact?: boolean;
}

export function PasswordStrength({
  password,
  compact = false,
}: PasswordStrengthProps) {
  const strength = calculatePasswordStrength(password || '');

  const barColors: Record<number, string> = {
    0: 'bg-slate-200 dark:bg-slate-800',
    1: 'bg-rose-500',
    2: 'bg-amber-500',
    3: 'bg-indigo-600',
    4: 'bg-emerald-600',
  };

  const textColors: Record<number, string> = {
    0: 'text-slate-400 dark:text-slate-500',
    1: 'text-rose-600 dark:text-rose-400',
    2: 'text-amber-600 dark:text-amber-400',
    3: 'text-indigo-600 dark:text-indigo-400',
    4: 'text-emerald-600 dark:text-emerald-400',
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 px-3.5 py-2.5 space-y-2 transition-all',
        compact ? 'mt-1' : 'mt-1.5'
      )}
      data-testid="password-strength-meter"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          Password strength
        </span>
        <span
          data-testid="password-strength-label"
          className={`font-mono text-[11px] font-semibold ${textColors[strength.score]}`}
        >
          {strength.label}
        </span>
      </div>

      <div
        className="grid grid-cols-4 gap-1.5"
        role="progressbar"
        aria-label="Password strength meter"
        aria-valuenow={strength.score}
        aria-valuemin={0}
        aria-valuemax={4}
      >
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              strength.score >= level
                ? barColors[strength.score]
                : 'bg-slate-200 dark:bg-slate-800'
            }`}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 pt-0.5 text-[11px]">
        {[
          { key: 'minLength', label: '8+ chars', ok: strength.checks.minLength },
          { key: 'hasUppercase', label: 'Uppercase', ok: strength.checks.hasUppercase },
          { key: 'hasLowercase', label: 'Lowercase', ok: strength.checks.hasLowercase },
          { key: 'hasNumber', label: 'Number', ok: strength.checks.hasNumber },
          { key: 'hasSpecial', label: 'Symbol', ok: strength.checks.hasSpecial },
        ].map((item) => (
          <div
            key={item.key}
            className={cn(
              'inline-flex items-center gap-1 font-mono whitespace-nowrap transition-colors',
              item.ok
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-400 dark:text-slate-500'
            )}
          >
            {item.ok ? (
              <Check className="w-3 h-3 shrink-0 stroke-[2.5]" />
            ) : (
              <span aria-hidden="true">·</span>
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 10. SocialLoginButtons
 * Google Sign In and GitHub Sign In buttons.
 */
export interface SocialLoginButtonsProps {
  loadingProvider: 'google' | 'github' | null;
  onSelectProvider: (provider: 'google' | 'github') => void;
}

export function SocialLoginButtons({
  loadingProvider,
  onSelectProvider,
}: SocialLoginButtonsProps) {
  return (
    <div className="space-y-3">
      <div className="relative py-0.5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Button
          type="button"
          variant="outline"
          disabled={loadingProvider !== null}
          onClick={() => onSelectProvider('google')}
          className="w-full text-xs font-medium"
        >
          {loadingProvider === 'google' ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          ) : (
            <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          )}
          <span>Google</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={loadingProvider !== null}
          onClick={() => onSelectProvider('github')}
          className="w-full text-xs font-medium"
        >
          {loadingProvider === 'github' ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-900 dark:text-white" />
          ) : (
            <Code2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          )}
          <span>GitHub</span>
        </Button>
      </div>
    </div>
  );
}

/**
 * SubtleSpinner
 * Refined dual-ring spinner animation for enterprise auth submission buttons.
 */
export function SubtleSpinner({ className }: { className?: string }) {
  return (
    <span
      className={cn('relative inline-flex items-center justify-center w-4 h-4 shrink-0', className)}
      aria-hidden="true"
    >
      <Loader2 className="w-4 h-4 animate-spin text-current opacity-95" />
    </span>
  );
}

/**
 * FieldFeedbackMessage
 * Floating non-intrusive validation tooltip for real-time Zod errors.
 * Anchors cleanly to its parent relative field wrapper without shifting form layout.
 */
export function FieldFeedbackMessage({
  error,
  id,
  floating = true,
}: {
  error?: string;
  id?: string;
  floating?: boolean;
}) {
  if (!error) return null;

  if (!floating) {
    return (
      <p
        id={id}
        role="alert"
        data-testid={id || 'field-validation-tooltip'}
        className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium animate-in fade-in duration-150"
      >
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500 dark:text-rose-400" />
        <span>{error}</span>
      </p>
    );
  }

  return (
    <div
      id={id}
      role="alert"
      data-testid={id || 'field-validation-tooltip'}
      className="pointer-events-none absolute right-0 -bottom-2 translate-y-full z-30 max-w-full sm:max-w-[280px] rounded-lg bg-[#0B1120] dark:bg-rose-950/95 text-white dark:text-rose-100 border border-slate-800 dark:border-rose-800/80 px-2.5 py-1.5 text-[11px] font-medium leading-tight shadow-[0_8px_20px_rgba(15,23,42,0.18)] flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Subtle upward pointer arrow */}
      <span
        aria-hidden="true"
        className="absolute right-3.5 -top-1 w-2 h-2 rotate-45 bg-[#0B1120] dark:bg-rose-950 border-l border-t border-slate-800 dark:border-rose-800/80"
      />
      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
      <span className="truncate">{error}</span>
    </div>
  );
}

/**
 * 11. AuthSubmitButton
 * Primary OFC360 dark enterprise submit button with refined loading spinner and duplicate-submission lock.
 */
export interface AuthSubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  showArrow?: boolean;
  children: React.ReactNode;
}

export function AuthSubmitButton({
  isLoading = false,
  loadingText = 'Processing...',
  showArrow = false,
  children,
  className,
  disabled,
  ...props
}: AuthSubmitButtonProps) {
  const isDisabled = Boolean(isLoading || disabled);

  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      className={cn(
        'h-9 px-5 min-w-[160px] w-fit mx-auto rounded-lg bg-[#0B1120] hover:bg-slate-800 active:scale-[0.99] dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs sm:text-[13px] flex items-center justify-center gap-2 transition-all duration-150 shadow-xs disabled:opacity-60 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer select-none',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <SubtleSpinner className="w-3.5 h-3.5" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          {showArrow && <ArrowRight className="w-3.5 h-3.5" />}
        </>
      )}
    </button>
  );
}


/**
 * 12. AuthErrorMessage
 * Clean, subtle error alert for authentication failures.
 */
export interface AuthErrorMessageProps {
  title?: string;
  message: string | null;
  testId?: string;
}

export function AuthErrorMessage({
  title,
  message,
  testId = 'auth-error-alert',
}: AuthErrorMessageProps) {
  if (!message) return null;
  return (
    <div
      role="alert"
      data-testid={testId}
      className="rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 px-3.5 py-3 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5 mb-4"
    >
      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        <p className="text-rose-800 dark:text-rose-300 leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}

/**
 * 13. AuthSuccessState
 * Clean confirmation banner or full-state card for successful auth operations.
 */
export interface AuthSuccessStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  testId?: string;
}

export function AuthSuccessState({
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  testId = 'auth-success-banner',
}: AuthSuccessStateProps) {
  return (
    <div
      role="status"
      data-testid={testId}
      className="rounded-xl border border-emerald-200/90 dark:border-emerald-900/60 bg-emerald-50/75 dark:bg-emerald-950/40 p-4 space-y-3 mb-4"
    >
      <div className="flex items-start gap-2.5">
        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-emerald-950 dark:text-emerald-100">
            {title}
          </p>
          <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center justify-end gap-2 pt-1">
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
          {actionLabel && onAction && (
            <Button type="button" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 14. AuthFooter
 * Bottom prompt and link inside AuthCard (e.g. "Don't have an account? Create Account").
 */
export interface AuthFooterProps {
  promptText?: string;
  actionLabel: string;
  onAction: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
}

export function AuthFooter({
  promptText,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
}: AuthFooterProps) {
  return (
    <div className="pt-4 mt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
      {secondaryLabel && onSecondaryAction ? (
        <button
          type="button"
          onClick={onSecondaryAction}
          className="font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          {secondaryLabel}
        </button>
      ) : (
        <span>{promptText}</span>
      )}

      <button
        type="button"
        onClick={onAction}
        className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors cursor-pointer"
      >
        {actionLabel}
      </button>
    </div>
  );
}
