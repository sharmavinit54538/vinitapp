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
  iconColor: string;
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

export const FONT_SANS = 'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
// Strictly use Inter with tabular-nums rather than stylized monospace numeric fonts
export const FONT_MONO = 'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const LIGHT_PALETTE: NativePalette = {
  background: '#F3F2EF', // LinkedIn warm neutral section separator
  surface: '#FFFFFF', // Pure white primary surface
  surfaceMuted: '#F3F2EF', // Light neutral container bg
  surfaceElevated: '#FFFFFF',
  inputBg: '#F3F2EF',
  border: '#E5E7EB', // Thin crisp border
  borderSubtle: '#E5E7EB',
  textPrimary: '#171717', // Crisp near-black
  textSecondary: '#404040', // Icon & secondary dark neutral
  textMuted: '#666666', // LinkedIn muted secondary text
  iconColor: '#404040',
  primary: '#0A66C2', // LinkedIn primary action blue
  primaryLight: '#EBF4FD',
  primaryText: '#FFFFFF',
  secondaryCta: '#171717',
  emerald: '#15803D', // Semantic success green
  emeraldBg: '#F0FDF4',
  amber: '#B45309', // Semantic warning amber
  amberBg: '#FFFBEB',
  rose: '#B91C1C', // Semantic error red
  roseBg: '#FEF2F2',
  violet: '#0A66C2', // Replace purple with LinkedIn primary blue
  violetBg: '#EBF4FD',
  sky: '#0A66C2',
  skyBg: '#EBF4FD',
  tabBarBg: '#FFFFFF',
  headerBg: '#FFFFFF',
  overlay: 'rgba(23, 23, 23, 0.50)',
  handleBar: '#D4D4D8',
};

export const DARK_PALETTE: NativePalette = {
  background: '#0A0A0A',
  surface: '#171717',
  surfaceMuted: '#262626',
  surfaceElevated: '#262626',
  inputBg: '#262626',
  border: '#2E2E2E',
  borderSubtle: '#262626',
  textPrimary: '#FAFAFA',
  textSecondary: '#D4D4D4',
  textMuted: '#A3A3A3',
  iconColor: '#D4D4D4',
  primary: '#3B82F6',
  primaryLight: 'rgba(59, 130, 246, 0.16)',
  primaryText: '#FFFFFF',
  secondaryCta: '#262626',
  emerald: '#22C55E',
  emeraldBg: 'rgba(34, 197, 94, 0.14)',
  amber: '#F59E0B',
  amberBg: 'rgba(245, 158, 11, 0.14)',
  rose: '#EF4444',
  roseBg: 'rgba(239, 68, 68, 0.14)',
  violet: '#3B82F6',
  violetBg: 'rgba(59, 130, 246, 0.14)',
  sky: '#38BDF8',
  skyBg: 'rgba(56, 189, 248, 0.14)',
  tabBarBg: '#171717',
  headerBg: '#171717',
  overlay: 'rgba(0, 0, 0, 0.72)',
  handleBar: '#404040',
};

export function getPalette(isDark: boolean): NativePalette {
  return isDark ? DARK_PALETTE : LIGHT_PALETTE;
}
