export type DataSectionState = 'loading' | 'error' | 'empty' | 'populated';

export interface QuickActionConfig {
  id: 'add_employee' | 'notice' | 'check_in' | 'payroll';
  label: string;
  requiresManage: boolean;
}

export const QUICK_ACTIONS_SPEC: QuickActionConfig[] = [
  { id: 'add_employee', label: 'Add employee', requiresManage: true },
  { id: 'notice', label: 'Notice', requiresManage: true },
  { id: 'check_in', label: 'Check-in', requiresManage: false },
  { id: 'payroll', label: 'Payroll', requiresManage: true },
];

/**
 * Formats the current date dynamically for the Workforce overview header.
 */
export function formatDynamicOverviewDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Returns the current year dynamically for the holiday metric label.
 */
export function getCurrentYearHolidayLabel(date: Date = new Date()): string {
  return `${date.getFullYear()} holidays`;
}

/**
 * Determines the visual state of a data-backed section (e.g. Pending approvals).
 * Strictly guarantees the empty state is NEVER displayed when loading or errored.
 */
export function resolveDataSectionState(params: {
  isLoading: boolean;
  isError: boolean;
  itemCount: number | null | undefined;
}): DataSectionState {
  if (params.isLoading) return 'loading';
  if (params.isError || params.itemCount == null) return 'error';
  if (params.itemCount === 0) return 'empty';
  return 'populated';
}

/**
 * Formats a numeric KPI value without ever interpreting unavailable/errored data as 0.
 */
export function formatMetricValue(params: {
  value: number | null | undefined;
  isLoading: boolean;
  isError: boolean;
  suffix?: string;
}): string {
  if (params.isLoading) return '…';
  if (params.isError || params.value === null || params.value === undefined || Number.isNaN(params.value)) {
    return '—';
  }
  const formatted = new Intl.NumberFormat('en-US').format(params.value);
  return params.suffix ? `${formatted}${params.suffix}` : formatted;
}

/**
 * Filters quick actions based on RBAC management permissions.
 */
export function getAuthorizedQuickActions(canManage: boolean): QuickActionConfig[] {
  return QUICK_ACTIONS_SPEC.filter((item) => !item.requiresManage || canManage);
}

/**
 * Extracts crisp 1–2 letter initials from a user's full name for the circular avatar.
 */
export function getInitials(fullName?: string | null): string {
  if (!fullName || !fullName.trim()) return 'U';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
}
