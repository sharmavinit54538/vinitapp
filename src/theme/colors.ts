export interface NativePalette {
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceElevated: string;
  inputBg: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  primaryText: string;
  secondaryCta: string;
  emerald: string;
  emeraldBg: string;
  amber: string;
  amberBg: string;
  rose: string;
  roseBg: string;
  violet: string;
  violetBg: string;
  sky: string;
  skyBg: string;
  tabBarBg: string;
  headerBg: string;
  overlay: string;
  handleBar: string;
}

export const FONT_SANS = 'var(--font-sans), "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif';
export const FONT_MONO = 'var(--font-mono), "JetBrains Mono", monospace';

export const LIGHT_PALETTE: NativePalette = {
  background: '#F8FAFC', // slate-50
  surface: '#FFFFFF', // white
  surfaceMuted: '#F1F5F9', // slate-100/90
  surfaceElevated: '#FFFFFF',
  inputBg: '#F8FAFC', // slate-50
  border: '#E2E8F0', // slate-200/80
  borderSubtle: '#F1F5F9', // slate-100
  textPrimary: '#0F172A', // slate-900
  textSecondary: '#475569', // slate-600
  textMuted: '#64748B', // slate-500
  primary: '#4F46E5', // indigo-600
  primaryLight: '#EEF2FF', // indigo-50
  primaryText: '#FFFFFF',
  secondaryCta: '#0F172A', // slate-900
  emerald: '#059669',
  emeraldBg: '#ECFDF5',
  amber: '#D97706',
  amberBg: '#FFFBEB',
  rose: '#E11D48',
  roseBg: '#FFF1F2',
  violet: '#7C3AED',
  violetBg: '#F5F3FF',
  sky: '#0284C7',
  skyBg: '#F0F9FF',
  tabBarBg: 'rgba(255, 255, 255, 0.94)',
  headerBg: 'rgba(255, 255, 255, 0.90)',
  overlay: 'rgba(2, 6, 23, 0.60)', // slate-950/60
  handleBar: '#E2E8F0', // slate-200
};

export const DARK_PALETTE: NativePalette = {
  background: '#020617', // slate-950
  surface: '#0F172A', // slate-900
  surfaceMuted: '#1E293B', // slate-800/80
  surfaceElevated: '#1E293B',
  inputBg: '#1E293B', // slate-800
  border: '#1E293B', // slate-800
  borderSubtle: '#1E293B',
  textPrimary: '#FFFFFF',
  textSecondary: '#CBD5E1', // slate-300
  textMuted: '#94A3B8', // slate-400
  primary: '#4F46E5', // indigo-600
  primaryLight: 'rgba(79, 70, 229, 0.18)',
  primaryText: '#FFFFFF',
  secondaryCta: '#1E293B', // slate-800
  emerald: '#10B981',
  emeraldBg: 'rgba(16, 185, 129, 0.14)',
  amber: '#F59E0B',
  amberBg: 'rgba(245, 158, 11, 0.14)',
  rose: '#F43F5E',
  roseBg: 'rgba(244, 63, 94, 0.14)',
  violet: '#8B5CF6',
  violetBg: 'rgba(139, 92, 246, 0.14)',
  sky: '#38BDF8',
  skyBg: 'rgba(56, 189, 248, 0.14)',
  tabBarBg: 'rgba(15, 23, 42, 0.94)',
  headerBg: 'rgba(15, 23, 42, 0.90)',
  overlay: 'rgba(2, 6, 23, 0.72)',
  handleBar: '#334155', // slate-700
};

export function getPalette(isDark: boolean): NativePalette {
  return isDark ? DARK_PALETTE : LIGHT_PALETTE;
}
