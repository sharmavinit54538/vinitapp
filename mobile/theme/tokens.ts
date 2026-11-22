/**
 * OFC360 LinkedIn-inspired minimal native mobile design tokens.
 */
export const MOBILE_COLORS = {
  background: '#FFFFFF',
  sectionBackground: '#F3F2EF',
  textPrimary: '#171717',
  textSecondary: '#666666',
  border: '#E5E7EB',
  accent: '#0A66C2',
  accentPressed: '#004182',
  icon: '#404040',
  iconInactive: '#666666',
  success: '#15803D',
  successSoft: '#DCFCE7',
  warning: '#B45309',
  warningSoft: '#FEF3C7',
  danger: '#B91C1C',
  dangerSoft: '#FEE2E2',
  subtleSurface: '#F3F2EF',
} as const;

export const MOBILE_RADIUS = {
  none: 0,
  sm: 4,
  md: 6,
  lg: 8,
} as const;

export function getMobileInitials(fullName?: string | null): string {
  const cleaned = (fullName || '').trim();
  if (!cleaned) return 'OF';
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatDynamicMobileDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
