'use client';

import React, { useId } from 'react';
import {
  IconConfig,
  computeLogoGeometry,
  generateSquirclePath,
} from '@/lib/icon-math';

interface Ofc360VectorIconProps {
  config: IconConfig;
  size?: number | string;
  showGrid?: boolean;
  showAnatomy?: boolean;
  frameless?: boolean;
  className?: string;
}

export function Ofc360VectorIcon({
  config,
  size = '100%',
  showGrid = false,
  showAnatomy = false,
  frameless = false,
  className = '',
}: Ofc360VectorIconProps) {
  const uid = useId().replace(/:/g, '');
  const geo = computeLogoGeometry(config);

  const squirclePath = frameless
    ? 'M 0 0 L 1024 0 L 1024 1024 L 0 1024 Z'
    : generateSquirclePath(1024, 64, config.squircleRadius);

  const isDarkSurface =
    config.surfaceStyle === 'deep-navy' ||
    config.surfaceStyle === 'electric-gradient';

  const bgFill =
    config.surfaceStyle === 'electric-gradient'
      ? `url(#ofc-squircle-blue-grad-${uid})`
      : config.surfaceStyle === 'deep-navy'
      ? `url(#ofc-surface-navy-${uid})`
      : config.surfaceStyle === 'light-minimal'
      ? `url(#ofc-surface-light-${uid})`
      : `url(#ofc-surface-glass-${uid})`;

  const primarySymbolFill = isDarkSurface
    ? `url(#ofc-silver-top-${uid})`
    : `url(#ofc-brand-grad-${uid})`;
  const bevelSymbolFill = isDarkSurface
    ? `url(#ofc-silver-bevel-${uid})`
    : config.deepNavy;
  const textFill = isDarkSurface
    ? `url(#ofc-silver-top-${uid})`
    : config.deepNavy;
  const degreeColor = isDarkSurface ? '#FFFFFF' : config.electricBlue;
  const fontSize360 = Math.round(104 * config.core360Scale);
  const graphicOpacity = Number(((config.iconOpacity ?? 100) / 100).toFixed(2));

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={frameless ? '64 64 896 896' : '0 0 1024 1024'}
      width={size}
      height={size}
      fill="none"
      className={className}
      role="img"
      aria-label={`OFC360 mobile app icon — ${config.name}`}
      data-testid="ofc360-vector-svg"
      data-preset={config.id}
      data-wing-sweep={config.wingSweep}
      data-ring-thickness={config.ringThickness}
      data-rotation-angle={config.rotationAngle || 0}
      data-icon-opacity={config.iconOpacity ?? 100}
    >
      <defs>
        {/* Official OFC360 Squircle Diagonal Gradient: Deep Navy Bottom-Left (#040D21/#081B3A) to Vibrant Electric Blue Top-Right (#0052FF) */}
        <linearGradient
          id={`ofc-squircle-blue-grad-${uid}`}
          x1="12%"
          y1="88%"
          x2="88%"
          y2="12%"
        >
          <stop offset="0%" stopColor="#040D21" />
          <stop offset="42%" stopColor={config.deepNavy} />
          <stop offset="82%" stopColor={config.electricBlue} />
          <stop offset="100%" stopColor="#1D70FF" />
        </linearGradient>

        {/* Metallic Silver-White Top Facet Gradient */}
        <linearGradient
          id={`ofc-silver-top-${uid}`}
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="68%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>

        {/* 3D Sculpted Silver Bevel Facet Gradient */}
        <linearGradient
          id={`ofc-silver-bevel-${uid}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="50%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        {/* Brand Blue Gradient for Light Surface Editions */}
        <linearGradient
          id={`ofc-brand-grad-${uid}`}
          x1="0%"
          y1="80%"
          x2="100%"
          y2="20%"
        >
          <stop offset="0%" stopColor={config.deepNavy} />
          <stop offset="65%" stopColor={config.electricBlue} />
          <stop offset="100%" stopColor={config.accentCyan} />
        </linearGradient>

        <linearGradient
          id={`ofc-surface-light-${uid}`}
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>

        <linearGradient
          id={`ofc-surface-navy-${uid}`}
          x1="10%"
          y1="90%"
          x2="90%"
          y2="10%"
        >
          <stop offset="0%" stopColor="#030917" />
          <stop offset="65%" stopColor={config.deepNavy} />
          <stop offset="100%" stopColor="#0F2E6B" />
        </linearGradient>

        <linearGradient
          id={`ofc-surface-glass-${uid}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        <filter
          id={`ofc-squircle-shadow-${uid}`}
          x="-5%"
          y="-5%"
          width="110%"
          height="115%"
          filterUnits="userSpaceOnUse"
        >
          <feDropShadow
            dx="-6"
            dy={Math.round(config.shadowElevation * 0.72)}
            stdDeviation={config.shadowElevation}
            floodColor="#040D21"
            floodOpacity="0.28"
          />
        </filter>

        <filter
          id={`ofc-symbol-shadow-${uid}`}
          x="80"
          y="80"
          width="880"
          height="880"
          filterUnits="userSpaceOnUse"
        >
          <feDropShadow
            dx="0"
            dy="12"
            stdDeviation="14"
            floodColor={isDarkSurface ? '#020817' : config.electricBlue}
            floodOpacity={isDarkSurface ? '0.32' : '0.18'}
          />
        </filter>
      </defs>

      {/* Pure Minimalist Light Background Frame (when not frameless) */}
      {!frameless && <rect width="1024" height="1024" fill="#F4F6F9" rx="32" />}

      {/* Overall Icon Graphic Opacity Wrapper (50% to 100%) */}
      <g opacity={graphicOpacity} data-testid="ofc360-opacity-wrapper">
        {/* Rounded Square Squircle App Icon Frame */}
        <path
          d={squirclePath}
          fill={bgFill}
          filter={frameless ? undefined : `url(#ofc-squircle-shadow-${uid})`}
          stroke={
            frameless
              ? 'none'
              : isDarkSurface
              ? 'rgba(255,255,255,0.12)'
              : 'rgba(8,27,58,0.08)'
          }
          strokeWidth={frameless ? 0 : 2.5}
        />

        {/* Primary OFC360 Vector Symbol: 3D Faceted 'O' + '360' + S-Curve 'F' Wings + 4 Speed Streaks */}
        <g
          filter={`url(#ofc-symbol-shadow-${uid})`}
          transform={`rotate(${config.rotationAngle || 0} 512 512)`}
          data-testid="ofc360-rotated-symbol"
          data-rotation-angle={config.rotationAngle || 0}
          data-icon-opacity={config.iconOpacity ?? 100}
        >
          {/* Stylized Open-Right Circular Letter 'O' + 3D Inner Bevel Facet */}
          <path d={geo.cutoutArcPath} fill={primarySymbolFill} />
          <path
            d={geo.innerBevelArcPath}
            fill={bevelSymbolFill}
            opacity="0.82"
          />

          {/* Upper Sculpted S-Curve Aerodynamic 'F' Wing + 3D Bevel Ridge */}
          <path d={geo.upperWingPath} fill={primarySymbolFill} />
          <path
            d={geo.upperWingBevelPath}
            fill={bevelSymbolFill}
            opacity="0.72"
          />

          {/* Middle/Lower Sculpted S-Curve Aerodynamic 'F' Wing Sweeping from 'O' + 3D Bevel Ridge */}
          <path d={geo.middleWingPath} fill={primarySymbolFill} />
          <path
            d={geo.middleWingBevelPath}
            fill={bevelSymbolFill}
            opacity="0.74"
          />

          {/* 4 Sharp Horizontal Aerodynamic Speed Streaks (2 Top, 2 Bottom) */}
          {config.showSpeedStreaks !== false && (
            <g data-testid="ofc360-speed-streaks">
              <path
                d={geo.topStreak1Path}
                fill={primarySymbolFill}
                opacity="0.92"
              />
              <path
                d={geo.topStreak2Path}
                fill={primarySymbolFill}
                opacity="0.85"
              />
              <path
                d={geo.bottomStreak1Path}
                fill={primarySymbolFill}
                opacity="0.9"
              />
              <path
                d={geo.bottomStreak2Path}
                fill={primarySymbolFill}
                opacity="0.8"
              />
            </g>
          )}

          {/* Center '360' Core Embedded Cleanly Inside the 'O' */}
          <text
            x={geo.ringCenter.x - (config.showDegreeDot ? 5 : 0)}
            y={geo.ringCenter.y + Math.round(fontSize360 * 0.35)}
            textAnchor="middle"
            fill={textFill}
            style={{
              fontFamily:
                "var(--font-display), 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
              fontWeight: 800,
              fontSize: `${fontSize360}px`,
              letterSpacing: '-0.03em',
            }}
          >
            360
          </text>

          {/* Optional 360° Orbital Degree Precision Node */}
          {config.showDegreeDot && (
            <circle
              cx={geo.ringCenter.x + Math.round(fontSize360 * 0.94)}
              cy={geo.ringCenter.y - Math.round(fontSize360 * 0.35)}
              r="9.5"
              fill={degreeColor}
            />
          )}
        </g>
      </g>

      {/* Apple HIG 1024x1024 Keyline Construction Grid Overlay */}
      {showGrid && (
        <g
          stroke={isDarkSurface ? 'rgba(147,197,253,0.42)' : 'rgba(0,82,255,0.28)'}
          strokeWidth="2"
          fill="none"
          data-testid="icon-construction-grid"
        >
          <rect
            x="64"
            y="64"
            width="896"
            height="896"
            rx={config.squircleRadius}
            strokeDasharray="10 6"
          />
          <rect
            x="160"
            y="160"
            width="704"
            height="704"
            strokeDasharray="4 6"
            strokeOpacity="0.6"
          />
          <line x1="512" y1="32" x2="512" y2="992" strokeDasharray="8 8" />
          <line x1="32" y1="512" x2="992" y2="512" strokeDasharray="8 8" />
          <circle
            cx={geo.ringCenter.x}
            cy={geo.ringCenter.y}
            r={geo.outerRadius}
          />
          <circle
            cx={geo.ringCenter.x}
            cy={geo.ringCenter.y}
            r={geo.innerRadius}
            strokeDasharray="6 4"
          />
        </g>
      )}

      {/* Geometric Anatomy & Aerodynamic Vector Callouts */}
      {showAnatomy && (
        <g data-testid="icon-anatomy-callouts">
          <line
            x1={geo.ringCenter.x - geo.outerRadius}
            y1={geo.ringCenter.y - geo.outerRadius - 24}
            x2={geo.ringCenter.x}
            y2={geo.ringCenter.y - geo.outerRadius - 24}
            stroke="#38BDF8"
            strokeWidth="2.5"
          />
          <rect
            x={geo.ringCenter.x - geo.outerRadius}
            y={geo.ringCenter.y - geo.outerRadius - 62}
            width="142"
            height="28"
            rx="4"
            fill="#081B3A"
          />
          <text
            x={geo.ringCenter.x - geo.outerRadius + 71}
            y={geo.ringCenter.y - geo.outerRadius - 43}
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="15"
            fontFamily="monospace"
          >
            O-RING R={geo.outerRadius}
          </text>

          <rect
            x="675"
            y="196"
            width="204"
            height="28"
            rx="4"
            fill="#0052FF"
          />
          <text
            x="777"
            y="215"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="15"
            fontFamily="monospace"
          >
            F-WING SWEEP {config.wingSweep}%
          </text>
        </g>
      )}
    </svg>
  );
}
