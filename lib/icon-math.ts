/**
 * Pure mathematical geometry, color contrast, and SVG serialization utilities
 * for the OFC360 Enterprise SaaS HRMS App Icon Studio.
 * Faithfully matches the official OFC360 logo mark:
 * - Deep Navy (#081B3A) bottom-left to Vibrant Electric Blue (#0052FF) top-right squircle
 * - Dimensional silver-white circular 'O' with 3D inner bevel facets
 * - Bold white '360' numerals embedded cleanly in the center of the 'O'
 * - Two sculpted S-curve aerodynamic horizontal 'F' wings with 3D bevel ridges
 * - Four sharp horizontal aerodynamic speed streaks (2 above upper wing, 2 below lower wing)
 */

export interface IconConfig {
  id: string;
  name: string;
  deepNavy: string; // Default: #081B3A
  electricBlue: string; // Default: #0052FF
  accentCyan: string; // Default: #38BDF8
  surfaceStyle: 'electric-gradient' | 'deep-navy' | 'light-minimal' | 'dimensional-glass';
  squircleRadius: number; // 0 to 512 on 1024 canvas (228 = iOS standard 22.37%)
  ringThickness: number; // 44 to 88 on 1024 canvas
  wingSweep: number; // 0 to 100 (aerodynamic horizontal extension & bevel angle)
  wingGap: number; // 16 to 48 vertical spacing between top & middle F wings
  core360Scale: number; // 0.75 to 1.25 scale of embedded '360' numerals
  shadowElevation: number; // 0 to 48 px drop shadow blur/offset
  gradientAngle: number; // 0 to 360 degrees (45° = bottom-left #081B3A to top-right #0052FF)
  rotationAngle: number; // 0 to 360 degrees rotation of the icon orientation
  iconOpacity: number; // 50 to 100 overall opacity percentage of the icon graphic
  showDegreeDot: boolean; // False by default to match official logo reference
  showSpeedStreaks: boolean; // True by default (2 top + 2 bottom aerodynamic streaks)
}

export const DEFAULT_ICON_CONFIG: IconConfig = {
  id: 'official-ofc360-spec',
  name: 'Official OFC360 Logo Spec',
  deepNavy: '#081B3A',
  electricBlue: '#0052FF',
  accentCyan: '#2563EB',
  surfaceStyle: 'electric-gradient',
  squircleRadius: 228,
  ringThickness: 68,
  wingSweep: 82,
  wingGap: 28,
  core360Scale: 1.0,
  shadowElevation: 30,
  gradientAngle: 45,
  rotationAngle: 0,
  iconOpacity: 100,
  showDegreeDot: false,
  showSpeedStreaks: true,
};

export const ICON_PRESETS: IconConfig[] = [
  DEFAULT_ICON_CONFIG,
  {
    id: 'deep-navy-enterprise',
    name: 'Deep Navy Midnight',
    deepNavy: '#040D21',
    electricBlue: '#0052FF',
    accentCyan: '#38BDF8',
    surfaceStyle: 'deep-navy',
    squircleRadius: 228,
    ringThickness: 66,
    wingSweep: 84,
    wingGap: 26,
    core360Scale: 1.0,
    shadowElevation: 32,
    gradientAngle: 45,
    rotationAngle: 0,
    iconOpacity: 100,
    showDegreeDot: false,
    showSpeedStreaks: true,
  },
  {
    id: 'primary-light',
    name: 'Minimalist Light Squircle',
    deepNavy: '#081B3A',
    electricBlue: '#0052FF',
    accentCyan: '#38BDF8',
    surfaceStyle: 'light-minimal',
    squircleRadius: 228,
    ringThickness: 66,
    wingSweep: 78,
    wingGap: 28,
    core360Scale: 1.0,
    shadowElevation: 28,
    gradientAngle: 135,
    rotationAngle: 0,
    iconOpacity: 100,
    showDegreeDot: false,
    showSpeedStreaks: true,
  },
  {
    id: 'dimensional-glass',
    name: 'Dimensional Titanium',
    deepNavy: '#081B3A',
    electricBlue: '#0052FF',
    accentCyan: '#0EA5E9',
    surfaceStyle: 'dimensional-glass',
    squircleRadius: 240,
    ringThickness: 64,
    wingSweep: 76,
    wingGap: 30,
    core360Scale: 0.98,
    shadowElevation: 36,
    gradientAngle: 45,
    rotationAngle: 0,
    iconOpacity: 100,
    showDegreeDot: false,
    showSpeedStreaks: true,
  },
];

/**
 * Generates an Apple-style continuous superellipse squircle SVG path on a 1024x1024 artboard.
 */
export function generateSquirclePath(
  size: number = 1024,
  inset: number = 64,
  cornerRadius: number = 228
): string {
  const s = size - inset * 2;
  const r = Math.max(0, Math.min(s / 2, cornerRadius * (s / size)));
  const x0 = inset;
  const y0 = inset;
  const x1 = inset + s;
  const y1 = inset + s;
  const c = r * 0.55228475;

  return [
    `M ${x0 + r} ${y0}`,
    `L ${x1 - r} ${y0}`,
    `C ${x1 - r + c} ${y0}, ${x1} ${y0 + r - c}, ${x1} ${y0 + r}`,
    `L ${x1} ${y1 - r}`,
    `C ${x1} ${y1 - r + c}, ${x1 - r + c} ${y1}, ${x1 - r} ${y1}`,
    `L ${x0 + r} ${y1}`,
    `C ${x0 + r - c} ${y1}, ${x0} ${y1 - r + c}, ${x0} ${y1 - r}`,
    `L ${x0} ${y0 + r}`,
    `C ${x0} ${y0 + r - c}, ${x0 + r - c} ${y0}, ${x0 + r} ${y0}`,
    'Z',
  ].join(' ');
}

export interface WingGeometry {
  upperWingPath: string;
  upperWingBevelPath: string;
  middleWingPath: string;
  middleWingBevelPath: string;
  stemAccentPath: string;
  ringCenter: { x: number; y: number };
  outerRadius: number;
  innerRadius: number;
  cutoutArcPath: string;
  innerBevelArcPath: string;
  topStreak1Path: string;
  topStreak2Path: string;
  bottomStreak1Path: string;
  bottomStreak2Path: string;
}

/**
 * Computes the exact vector paths matching the official OFC360 logo reference:
 * - Sculpted circular 'O' centered at (376, 520) with inner 3D bevel shading
 * - Two S-curved aerodynamic horizontal 'F' wings with upper/lower 3D bevel facets
 * - Four tapered horizontal speed streaks (2 above upper wing, 2 below lower wing)
 */
export function computeLogoGeometry(config: IconConfig): WingGeometry {
  const thickness = Math.max(44, Math.min(92, config.ringThickness));
  const sweepFactor = Math.max(0, Math.min(100, config.wingSweep)) / 100;
  const gap = Math.max(16, Math.min(48, config.wingGap));

  // Center of the 'O' is positioned on the left half so the long aerodynamic 'F' wings balance the 1024x1024 squircle
  const cx = 374;
  const cy = 524;
  const outerRadius = 216;
  const innerRadius = outerRadius - thickness;

  // Open-right C/O ring calculation:
  // Outer ring runs from 38° (upper-right shoulder) counter-clockwise all the way around to 336° (lower-right tail)
  const degToRad = (deg: number) => (deg * Math.PI) / 180;
  const startOuterAngle = degToRad(-38); // upper-right crest
  const endOuterAngle = degToRad(26); // lower-right tail
  const startInnerAngle = degToRad(-24);
  const endInnerAngle = degToRad(18);

  const ox1 = Math.round(cx + outerRadius * Math.cos(startOuterAngle));
  const oy1 = Math.round(cy + outerRadius * Math.sin(startOuterAngle));
  const ox2 = Math.round(cx + outerRadius * Math.cos(endOuterAngle));
  const oy2 = Math.round(cy + outerRadius * Math.sin(endOuterAngle));

  const ix1 = Math.round(cx + innerRadius * Math.cos(startInnerAngle));
  const iy1 = Math.round(cy + innerRadius * Math.sin(startInnerAngle));
  const ix2 = Math.round(cx + innerRadius * Math.cos(endInnerAngle));
  const iy2 = Math.round(cy + innerRadius * Math.sin(endInnerAngle));

  // Open-right circular 'O' with angled chisel cuts facing the aerodynamic wings
  const cutoutArcPath = [
    `M ${ox1} ${oy1}`,
    `A ${outerRadius} ${outerRadius} 0 1 0 ${ox2} ${oy2}`,
    `L ${ix2} ${iy2}`,
    `A ${innerRadius} ${innerRadius} 0 1 1 ${ix1} ${iy1}`,
    'Z',
  ].join(' ');

  // 3D inner bevel shading arc along the top-inner and bottom-outer curve of the 'O'
  const midRadius = Math.round(innerRadius + thickness * 0.42);
  const mx1 = Math.round(cx + midRadius * Math.cos(startInnerAngle));
  const my1 = Math.round(cy + midRadius * Math.sin(startInnerAngle));
  const mx2 = Math.round(cx + midRadius * Math.cos(degToRad(155)));
  const my2 = Math.round(cy + midRadius * Math.sin(degToRad(155)));
  const ixLeft = Math.round(cx + innerRadius * Math.cos(degToRad(155)));
  const iyLeft = Math.round(cy + innerRadius * Math.sin(degToRad(155)));

  const innerBevelArcPath = [
    `M ${ix1} ${iy1}`,
    `A ${innerRadius} ${innerRadius} 0 0 0 ${ixLeft} ${iyLeft}`,
    `L ${mx2} ${my2}`,
    `A ${midRadius} ${midRadius} 0 0 1 ${mx1} ${my1}`,
    'Z',
  ].join(' ');

  // Upper sculpted S-curve aerodynamic wing
  // Rises from just outside the right gap of the 'O' and sweeps horizontally to a curved aerodynamic blade tip
  const w1BaseX = cx + innerRadius + 24;
  const w1BaseBottomY = cy - 12;
  const w1ShoulderX = cx + outerRadius + 38;
  const w1TopY = cy - 138;
  const w1BladeBottomY = w1TopY + thickness + 6;
  const w1TipX = Math.round(740 + sweepFactor * 125);
  const w1UnderTipX = w1TipX - Math.round(52 + sweepFactor * 20);

  const upperWingPath = [
    `M ${w1BaseX} ${w1BaseBottomY}`,
    `C ${w1BaseX + 4} ${w1TopY + 34}, ${w1ShoulderX - 28} ${w1TopY}, ${w1ShoulderX + 26} ${w1TopY}`,
    `L ${w1TipX} ${w1TopY}`,
    `C ${w1TipX - 10} ${w1TopY + 38}, ${w1UnderTipX + 24} ${w1BladeBottomY}, ${w1UnderTipX} ${w1BladeBottomY}`,
    `L ${w1ShoulderX + 22} ${w1BladeBottomY}`,
    `C ${w1ShoulderX - 18} ${w1BladeBottomY}, ${w1BaseX + 22} ${w1BladeBottomY + 18}, ${w1BaseX} ${w1BaseBottomY}`,
    'Z',
  ].join(' ');

  // 3D lower bevel facet of Upper Wing
  const w1MidY = Math.round((w1TopY + w1BladeBottomY) / 2);
  const upperWingBevelPath = [
    `M ${w1BaseX} ${w1BaseBottomY}`,
    `C ${w1BaseX + 12} ${w1MidY + 14}, ${w1ShoulderX - 14} ${w1MidY}, ${w1ShoulderX + 26} ${w1MidY}`,
    `L ${w1TipX - 18} ${w1MidY}`,
    `C ${w1TipX - 28} ${w1MidY + 22}, ${w1UnderTipX + 18} ${w1BladeBottomY}, ${w1UnderTipX} ${w1BladeBottomY}`,
    `L ${w1ShoulderX + 22} ${w1BladeBottomY}`,
    `C ${w1ShoulderX - 18} ${w1BladeBottomY}, ${w1BaseX + 22} ${w1BladeBottomY + 18}, ${w1BaseX} ${w1BaseBottomY}`,
    'Z',
  ].join(' ');

  // Middle/Lower sculpted S-curve aerodynamic wing
  // Sweeps seamlessly from the bottom-inner curve of the 'O' up into the second horizontal 'F' wing!
  const w2StartX = cx - 28;
  const w2StartY = cy + innerRadius - 4;
  const w2TopY = w1BladeBottomY + gap;
  const w2BladeBottomY = w2TopY + Math.round(thickness * 0.95);
  const w2ShoulderX = w1ShoulderX + 16;
  const w2TipX = Math.round(w1TipX - 88 - (1 - sweepFactor) * 18);
  const w2UnderTipX = w2TipX - Math.round(48 + sweepFactor * 16);

  const middleWingPath = [
    `M ${w2StartX} ${w2StartY}`,
    `C ${cx + 80} ${cy + innerRadius + 8}, ${w1BaseX + 12} ${w2TopY}, ${w2ShoulderX + 18} ${w2TopY}`,
    `L ${w2TipX} ${w2TopY}`,
    `C ${w2TipX - 10} ${w2TopY + 34}, ${w2UnderTipX + 20} ${w2BladeBottomY}, ${w2UnderTipX} ${w2BladeBottomY}`,
    `L ${w2ShoulderX + 12} ${w2BladeBottomY}`,
    `C ${w1BaseX + 36} ${w2BladeBottomY}, ${cx + 125} ${cy + outerRadius + 8}, ${w2StartX} ${w2StartY}`,
    'Z',
  ].join(' ');

  // 3D lower bevel facet of Middle Wing
  const w2MidY = Math.round((w2TopY + w2BladeBottomY) / 2);
  const middleWingBevelPath = [
    `M ${w2StartX} ${w2StartY}`,
    `C ${cx + 92} ${cy + innerRadius + 16}, ${w1BaseX + 24} ${w2MidY}, ${w2ShoulderX + 18} ${w2MidY}`,
    `L ${w2TipX - 16} ${w2MidY}`,
    `C ${w2TipX - 24} ${w2MidY + 18}, ${w2UnderTipX + 16} ${w2BladeBottomY}, ${w2UnderTipX} ${w2BladeBottomY}`,
    `L ${w2ShoulderX + 12} ${w2BladeBottomY}`,
    `C ${w1BaseX + 36} ${w2BladeBottomY}, ${cx + 125} ${cy + outerRadius + 8}, ${w2StartX} ${w2StartY}`,
    'Z',
  ].join(' ');

  // Top 2 horizontal aerodynamic speed streaks above the upper wing
  const ts1X = cx + 88;
  const ts1Y = cy - outerRadius - 6;
  const ts1TipX = Math.round(ts1X + 165 + sweepFactor * 55);
  const topStreak1Path = `M ${ts1X} ${ts1Y} L ${ts1TipX} ${ts1Y + 7} L ${ts1X + 18} ${ts1Y + 15} Z`;

  const ts2X = cx + 132;
  const ts2Y = ts1Y + 32;
  const ts2TipX = Math.round(ts2X + 195 + sweepFactor * 68);
  const topStreak2Path = `M ${ts2X} ${ts2Y} L ${ts2TipX} ${ts2Y + 7} L ${ts2X + 16} ${ts2Y + 15} Z`;

  // Bottom 2 horizontal aerodynamic speed streaks below the middle wing
  const bs1X = cx + outerRadius + 28;
  const bs1Y = w2BladeBottomY + 26;
  const bs1TipX = Math.round(bs1X + 110 + sweepFactor * 42);
  const bottomStreak1Path = `M ${bs1X} ${bs1Y} L ${bs1TipX} ${bs1Y + 6} L ${bs1X - 4} ${bs1Y + 14} Z`;

  const bs2X = bs1X - 14;
  const bs2Y = bs1Y + 30;
  const bs2TipX = Math.round(bs2X + 86 + sweepFactor * 34);
  const bottomStreak2Path = `M ${bs2X} ${bs2Y} L ${bs2TipX} ${bs2Y + 6} L ${bs2X - 4} ${bs2Y + 13} Z`;

  return {
    upperWingPath,
    upperWingBevelPath,
    middleWingPath,
    middleWingBevelPath,
    stemAccentPath: middleWingBevelPath,
    ringCenter: { x: cx, y: cy },
    outerRadius,
    innerRadius,
    cutoutArcPath,
    innerBevelArcPath,
    topStreak1Path,
    topStreak2Path,
    bottomStreak1Path,
    bottomStreak2Path,
  };
}

/**
 * Converts a 6-digit hex color string (e.g. "#081B3A") to RGB [0..255].
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace(/[^0-9a-fA-F]/g, '');
  if (clean.length !== 6) {
    return { r: 8, g: 27, b: 58 };
  }
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

/**
 * Computes WCAG 2.1 relative luminance for a hex color.
 */
export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const transform = (v: number) => {
    const sRGB = v / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  };
  const R = transform(r);
  const G = transform(g);
  const B = transform(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Computes WCAG 2.1 contrast ratio between two hex colors (1.0 to 21.0).
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/**
 * Serializes the complete OFC360 icon configuration into a standalone, production-ready
 * 1024x1024 SVG string matching the official OFC360 3D faceted winged logo.
 */
export function serializeIconToSvgString(config: IconConfig, includeGrid: boolean = false): string {
  const geo = computeLogoGeometry(config);
  const squirclePath = generateSquirclePath(1024, 64, config.squircleRadius);

  const isDarkSurface =
    config.surfaceStyle === 'deep-navy' || config.surfaceStyle === 'electric-gradient';

  const bgFill =
    config.surfaceStyle === 'electric-gradient'
      ? 'url(#ofc-squircle-blue-grad)'
      : config.surfaceStyle === 'deep-navy'
      ? 'url(#ofc-surface-navy)'
      : config.surfaceStyle === 'light-minimal'
      ? 'url(#ofc-surface-light)'
      : 'url(#ofc-surface-glass)';

  const primarySymbolFill = isDarkSurface
    ? 'url(#ofc-silver-top)'
    : 'url(#ofc-brand-grad)';
  const bevelSymbolFill = isDarkSurface
    ? 'url(#ofc-silver-bevel)'
    : config.deepNavy;
  const textFill = isDarkSurface ? 'url(#ofc-silver-top)' : config.deepNavy;
  const fontSize360 = Math.round(104 * config.core360Scale);

  const streaksMarkup =
    config.showSpeedStreaks !== false
      ? `<path d="${geo.topStreak1Path}" fill="${primarySymbolFill}" opacity="0.92" />
    <path d="${geo.topStreak2Path}" fill="${primarySymbolFill}" opacity="0.85" />
    <path d="${geo.bottomStreak1Path}" fill="${primarySymbolFill}" opacity="0.9" />
    <path d="${geo.bottomStreak2Path}" fill="${primarySymbolFill}" opacity="0.8" />`
      : '';

  const gridMarkup = includeGrid
    ? `<g stroke="${isDarkSurface ? 'rgba(255,255,255,0.18)' : 'rgba(8,27,58,0.14)'}" stroke-width="1.5" fill="none">
        <rect x="64" y="64" width="896" height="896" rx="${config.squircleRadius}" />
        <line x1="512" y1="64" x2="512" y2="960" stroke-dasharray="6 6" />
        <line x1="64" y1="512" x2="960" y2="512" stroke-dasharray="6 6" />
        <circle cx="${geo.ringCenter.x}" cy="${geo.ringCenter.y}" r="${geo.outerRadius}" stroke-dasharray="4 4" />
        <circle cx="${geo.ringCenter.x}" cy="${geo.ringCenter.y}" r="${geo.innerRadius}" stroke-dasharray="4 4" />
      </g>`
    : '';

  const opacityAttr = Number(((config.iconOpacity ?? 100) / 100).toFixed(2));

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" fill="none">
  <defs>
    <!-- Official OFC360 Squircle Diagonal Gradient: Deep Navy Bottom-Left to Vibrant Electric Blue Top-Right -->
    <linearGradient id="ofc-squircle-blue-grad" x1="12%" y1="88%" x2="88%" y2="12%">
      <stop offset="0%" stop-color="#040D21" />
      <stop offset="42%" stop-color="${config.deepNavy}" />
      <stop offset="82%" stop-color="${config.electricBlue}" />
      <stop offset="100%" stop-color="#1D70FF" />
    </linearGradient>
    <linearGradient id="ofc-silver-top" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="70%" stop-color="#F1F5F9" />
      <stop offset="100%" stop-color="#CBD5E1" />
    </linearGradient>
    <linearGradient id="ofc-silver-bevel" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#94A3B8" />
      <stop offset="50%" stop-color="#CBD5E1" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </linearGradient>
    <linearGradient id="ofc-brand-grad" x1="0%" y1="80%" x2="100%" y2="20%">
      <stop offset="0%" stop-color="${config.deepNavy}" />
      <stop offset="65%" stop-color="${config.electricBlue}" />
      <stop offset="100%" stop-color="${config.accentCyan}" />
    </linearGradient>
    <linearGradient id="ofc-surface-light" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F1F5F9" />
    </linearGradient>
    <linearGradient id="ofc-surface-navy" x1="10%" y1="90%" x2="90%" y2="10%">
      <stop offset="0%" stop-color="#030917" />
      <stop offset="65%" stop-color="${config.deepNavy}" />
      <stop offset="100%" stop-color="#0F2E6B" />
    </linearGradient>
    <linearGradient id="ofc-surface-glass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="60%" stop-color="#F8FAFC" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </linearGradient>
    <filter id="ofc-squircle-shadow" x="0" y="0" width="1024" height="1024" filterUnits="userSpaceOnUse">
      <feDropShadow dx="-8" dy="${Math.round(config.shadowElevation * 0.75)}" stdDeviation="${config.shadowElevation}" flood-color="#040D21" flood-opacity="0.28" />
    </filter>
    <filter id="ofc-symbol-shadow" x="80" y="80" width="880" height="880" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#020817" flood-opacity="0.28" />
    </filter>
  </defs>

  <!-- Pure Minimalist Light Studio Canvas -->
  <rect width="1024" height="1024" fill="#F4F6F9" />

  <g opacity="${opacityAttr}">
    <!-- Rounded Square Squircle App Icon Frame -->
    <path d="${squirclePath}" fill="${bgFill}" filter="url(#ofc-squircle-shadow)" />

    <!-- Stylized Circular Letter 'O' with 360 & Sculpted Aerodynamic 'F' Wings -->
    <g filter="url(#ofc-symbol-shadow)" transform="rotate(${config.rotationAngle || 0} 512 512)">
    <!-- Circular 'O' Ring Base & 3D Inner Bevel Facet -->
    <path d="${geo.cutoutArcPath}" fill="${primarySymbolFill}" />
    <path d="${geo.innerBevelArcPath}" fill="${bevelSymbolFill}" opacity="0.85" />

    <!-- Upper Sculpted Aerodynamic 'F' Wing + 3D Lower Bevel Facet -->
    <path d="${geo.upperWingPath}" fill="${primarySymbolFill}" />
    <path d="${geo.upperWingBevelPath}" fill="${bevelSymbolFill}" opacity="0.75" />

    <!-- Middle/Lower Sculpted Aerodynamic 'F' Wing Sweeping from 'O' + 3D Bevel Facet -->
    <path d="${geo.middleWingPath}" fill="${primarySymbolFill}" />
    <path d="${geo.middleWingBevelPath}" fill="${bevelSymbolFill}" opacity="0.75" />

    <!-- 4 Sharp Horizontal Aerodynamic Speed Streaks -->
    ${streaksMarkup}

    <!-- Embedded '360' Core Numerals inside the 'O' Center -->
    <text
      x="${geo.ringCenter.x}"
      y="${geo.ringCenter.y + Math.round(fontSize360 * 0.35)}"
      text-anchor="middle"
      fill="${textFill}"
      font-family="'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-weight="800"
      font-size="${fontSize360}"
      letter-spacing="-0.03em"
    >360</text>
    </g>
  </g>
  ${gridMarkup}
</svg>`;
}
