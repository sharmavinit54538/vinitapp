'use client';

import React, { useState } from 'react';
import { IconConfig } from '@/lib/icon-math';
import { Ofc360VectorIcon } from './ofc360-vector-icon';
import {
  Calendar,
  Mail,
  MessageSquare,
  Bell,
  CheckCircle2,
  Download,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';

interface DeviceContextPreviewsProps {
  config: IconConfig;
  onExportPng: (size: number, label: string) => void;
}

export function DeviceContextPreviews({
  config,
  onExportPng,
}: DeviceContextPreviewsProps) {
  const [wallpaperTheme, setWallpaperTheme] = useState<'light' | 'dark'>('light');
  const [badgeCount, setBadgeCount] = useState<number>(3);
  const [installedState, setInstalledState] = useState<'install' | 'installed'>('install');

  return (
    <div className="space-y-8" data-testid="device-context-previews">
      {/* Context Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4">
        <div>
          <h2
            className="text-base font-semibold text-[#081B3A]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            OS Home Screen, Notification &amp; App Store Validation
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Verify optical balance, squircle mask alignment, and silhouette legibility from 1024px down to 29px OS settings icons.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Wallpaper Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setWallpaperTheme('light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                wallpaperTheme === 'light'
                  ? 'bg-white text-[#081B3A] shadow-xs'
                  : 'text-slate-600 hover:text-[#081B3A]'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Light OS Wallpaper
            </button>
            <button
              type="button"
              onClick={() => setWallpaperTheme('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                wallpaperTheme === 'dark'
                  ? 'bg-[#081B3A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#081B3A]'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              Dark OS Wallpaper
            </button>
          </div>

          {/* Badge Counter Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {[0, 3, 12].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setBadgeCount(count)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                  badgeCount === count
                    ? 'bg-white text-[#081B3A] shadow-xs'
                    : 'text-slate-600 hover:text-[#081B3A]'
                }`}
              >
                {count === 0 ? 'No Badge' : `Badge (${count})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2-Column Device Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: iOS 18 Home Screen & Push Notification */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className="text-sm font-semibold text-[#081B3A]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                01. iOS 18 Home Screen &amp; Push Notification
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                60pt @3x (180×180px) continuous superellipse mask · 38pt notification banner
              </p>
            </div>
            <button
              type="button"
              onClick={() => onExportPng(180, 'iOS-180x180')}
              className="px-3 py-1.5 text-xs font-medium text-[#0052FF] bg-[#0052FF]/8 hover:bg-[#0052FF]/15 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Export 180×180 PNG
            </button>
          </div>

          {/* Simulated iOS Wallpaper Surface */}
          <div
            className={`rounded-xl p-6 border transition-colors ${
              wallpaperTheme === 'light'
                ? 'bg-gradient-to-br from-slate-100 via-blue-50/60 to-slate-200/80 border-slate-200/80 text-[#081B3A]'
                : 'bg-gradient-to-br from-[#061024] via-[#081B3A] to-[#0F2952] border-slate-800 text-white'
            }`}
          >
            {/* Push Notification Banner */}
            <div
              className={`rounded-2xl p-3.5 mb-8 backdrop-blur-md border transition-colors ${
                wallpaperTheme === 'light'
                  ? 'bg-white/90 border-white/60 text-[#081B3A] shadow-sm'
                  : 'bg-slate-900/85 border-slate-700/70 text-white shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] overflow-hidden shrink-0 border border-slate-200/30">
                  <Ofc360VectorIcon config={config} frameless />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold truncate">
                      OFC360 · People Operations
                    </span>
                    <span className="text-[11px] opacity-60 font-mono tabular-nums shrink-0">
                      2m ago
                    </span>
                  </div>
                  <p className="text-xs opacity-85 truncate mt-0.5">
                    Q4 360° Executive Review cycle is ready for sign-off (2 pending).
                  </p>
                </div>
              </div>
            </div>

            {/* Home Screen App Grid */}
            <div className="grid grid-cols-4 gap-6 justify-items-center py-2">
              {/* OFC360 App Icon Hero Slot */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-16 h-16 rounded-[15px] shadow-md">
                  <div className="w-full h-full rounded-[15px] overflow-hidden">
                    <Ofc360VectorIcon config={config} frameless />
                  </div>
                  {badgeCount > 0 && (
                    <span
                      data-testid="ios-badge-count"
                      className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-red-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center tabular-nums shadow-xs"
                    >
                      {badgeCount}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold tracking-tight whitespace-nowrap">
                  OFC360
                </span>
              </div>

              {/* Neighboring System Utility Icons for Contrast Comparison */}
              <div className="flex flex-col items-center gap-2 opacity-85">
                <div className="w-16 h-16 rounded-[15px] bg-white border border-slate-200/60 flex items-center justify-center shadow-xs text-slate-700">
                  <Calendar className="w-7 h-7 text-rose-500" />
                </div>
                <span className="text-xs font-medium whitespace-nowrap">Calendar</span>
              </div>

              <div className="flex flex-col items-center gap-2 opacity-85">
                <div className="w-16 h-16 rounded-[15px] bg-sky-500 flex items-center justify-center shadow-xs text-white">
                  <Mail className="w-7 h-7" />
                </div>
                <span className="text-xs font-medium whitespace-nowrap">Mail</span>
              </div>

              <div className="flex flex-col items-center gap-2 opacity-85">
                <div className="w-16 h-16 rounded-[15px] bg-emerald-500 flex items-center justify-center shadow-xs text-white">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <span className="text-xs font-medium whitespace-nowrap">Teams</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: App Store Enterprise Listing & Multi-Scale Size Ladder */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className="text-sm font-semibold text-[#081B3A]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                02. Enterprise App Store &amp; Multi-Resolution Scale Ladder
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Store listing lockup and optical sharpness across 128px, 64px, 40px, and 29px
              </p>
            </div>
            <button
              type="button"
              onClick={() => onExportPng(1024, 'AppStore-1024x1024')}
              className="px-3 py-1.5 text-xs font-medium text-[#0052FF] bg-[#0052FF]/8 hover:bg-[#0052FF]/15 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Export 1024×1024 PNG
            </button>
          </div>

          {/* App Store Header Lockup */}
          <div className="bg-[#F8FAFC] rounded-xl p-5 mb-5">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-[18px] overflow-hidden shrink-0 shadow-sm">
                <Ofc360VectorIcon config={config} frameless />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Enterprise HRMS</span>
                  <span aria-hidden="true">·</span>
                  <span>Workforce 360° Suite</span>
                </div>
                <h4
                  className="text-lg font-bold text-[#081B3A] truncate mt-0.5"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  OFC360 — People &amp; Payroll
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 tabular-nums">
                  <span className="font-semibold text-[#081B3A]">4.9 ★</span>
                  <span aria-hidden="true">·</span>
                  <span>14.2K Enterprise Ratings</span>
                  <span aria-hidden="true">·</span>
                  <span>SAML 2.0 SSO</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setInstalledState((s) => (s === 'install' ? 'installed' : 'install'))
                }
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  installedState === 'installed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#0052FF] text-white hover:bg-[#081B3A]'
                }`}
              >
                {installedState === 'installed' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Deployed
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    Get App
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Optical Scale Ladder */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
              <span>Optical Sharpness Ladder (‘360’ + ‘F’ Wing Legibility)</span>
              <span className="font-mono tabular-nums">Vector SVG 1:1</span>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-4 bg-[#F8FAFC] rounded-xl p-4">
              {[
                { px: 96, label: '96px iPad Pro', radius: '21px' },
                { px: 64, label: '64px iOS Home', radius: '14px' },
                { px: 48, label: '48px Android', radius: '11px' },
                { px: 36, label: '36px Spotlight', radius: '8px' },
                { px: 28, label: '28px Settings', radius: '6px' },
              ].map((item) => (
                <div key={item.px} className="flex flex-col items-center gap-2">
                  <div
                    style={{
                      width: `${item.px}px`,
                      height: `${item.px}px`,
                      borderRadius: item.radius,
                    }}
                    className="overflow-hidden shadow-xs"
                  >
                    <Ofc360VectorIcon config={config} frameless />
                  </div>
                  <span className="text-[11px] font-mono text-slate-600 tabular-nums whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
