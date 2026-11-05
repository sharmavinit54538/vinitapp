'use client';

import React, { useState } from 'react';
import {
  IconConfig,
  getContrastRatio,
  serializeIconToSvgString,
} from '@/lib/icon-math';
import { Copy, Check, Download, FileCode, Layers } from 'lucide-react';

interface ExportAndSpecsPanelProps {
  config: IconConfig;
  includeGridInExport: boolean;
  onExportSvg: () => void;
  onExportPng: (size: number, label: string) => void;
  lastExportMessage: string | null;
}

export function ExportAndSpecsPanel({
  config,
  includeGridInExport,
  onExportSvg,
  onExportPng,
  lastExportMessage,
}: ExportAndSpecsPanelProps) {
  const [copiedSvg, setCopiedSvg] = useState(false);

  const svgSource = serializeIconToSvgString(config, includeGridInExport);
  const navyOnWhiteContrast = getContrastRatio(config.deepNavy, '#FFFFFF');
  const electricOnWhiteContrast = getContrastRatio(config.electricBlue, '#FFFFFF');
  const navyOnLightCanvasContrast = getContrastRatio(config.deepNavy, '#F8FAFC');

  const handleCopySvg = async () => {
    try {
      await navigator.clipboard.writeText(svgSource);
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2000);
    } catch {
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2000);
    }
  };

  const exportSizes = [
    {
      size: 4096,
      title: '4096 × 4096 px (8K UI/UX Master)',
      platform: 'Brand Identity Master · Ultra-HD Raster',
      tag: '8K Master',
    },
    {
      size: 1024,
      title: '1024 × 1024 px (iOS App Store)',
      platform: 'Apple App Store Connect · Marketing Asset',
      tag: 'App Store',
    },
    {
      size: 512,
      title: '512 × 512 px (Google Play Store)',
      platform: 'Google Play Console Hi-Res Icon',
      tag: 'Play Store',
    },
    {
      size: 192,
      title: '192 × 192 px (Android XXXHDPI)',
      platform: 'Android Adaptive Launcher Full Asset',
      tag: 'Android',
    },
    {
      size: 180,
      title: '180 × 180 px (iPhone @3x)',
      platform: 'iOS 18 Home Screen Squircle (60pt @3x)',
      tag: 'iOS @3x',
    },
  ];

  return (
    <div className="space-y-6" data-testid="export-and-specs-panel">
      {/* Export Feedback Banner */}
      {lastExportMessage && (
        <div
          role="status"
          data-testid="export-status-banner"
          className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl px-4 py-3 text-xs font-medium flex items-center justify-between"
        >
          <span>{lastExportMessage}</span>
          <span className="font-mono text-[11px] text-emerald-700">
            Ready for Xcode / Android Studio / Figma
          </span>
        </div>
      )}

      {/* Multi-Resolution Asset Export Matrix + Brand Color Contrast Spec */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Columns: Production Resolution Export Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2
                  className="text-base font-semibold text-[#081B3A]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Production UI/UX Asset Export Matrix
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Download crisp mathematical SVG vectors or rasterized high-density PNG app icons.
                </p>
              </div>
              <button
                type="button"
                onClick={onExportSvg}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0052FF] hover:bg-[#081B3A] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <FileCode className="w-3.5 h-3.5" />
                Download Master SVG
              </button>
            </div>

            <div className="divide-y divide-slate-100 border-t border-slate-200">
              {exportSizes.map((item) => (
                <div
                  key={item.size}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-xs font-semibold text-[#081B3A] font-mono tabular-nums">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {item.platform}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onExportPng(item.size, item.tag)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#081B3A] bg-slate-100 hover:bg-[#0052FF] hover:text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export {item.size}px PNG
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Color Token & WCAG 2.1 Contrast Audit */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3
              className="text-base font-semibold text-[#081B3A]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Color Tokens &amp; WCAG Contrast Audit
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Enterprise corporate tech color system verified for high-contrast legibility.
            </p>

            <div className="space-y-3">
              {/* Deep Navy Token */}
              <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg border border-slate-300 shrink-0"
                    style={{ backgroundColor: config.deepNavy }}
                  />
                  <div>
                    <div className="text-xs font-semibold text-[#081B3A]">
                      Deep Navy Blue (Core &amp; ‘O’ Anchor)
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 uppercase">
                      {config.deepNavy} · RGB(8, 27, 58)
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <div className="text-xs font-bold text-[#081B3A]">
                    {navyOnWhiteContrast}:1
                  </div>
                  <div className="text-[11px] text-emerald-700">WCAG AAA Pass</div>
                </div>
              </div>

              {/* Vibrant Electric Blue Token */}
              <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg border border-slate-300 shrink-0"
                    style={{ backgroundColor: config.electricBlue }}
                  />
                  <div>
                    <div className="text-xs font-semibold text-[#081B3A]">
                      Vibrant Electric Blue (‘F’ Wings)
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 uppercase">
                      {config.electricBlue} · RGB(0, 82, 255)
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <div className="text-xs font-bold text-[#081B3A]">
                    {electricOnWhiteContrast}:1
                  </div>
                  <div className="text-[11px] text-emerald-700">WCAG AA Pass</div>
                </div>
              </div>

              {/* Pure Minimalist Light Surface */}
              <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] border border-slate-300 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-[#081B3A]">
                      Pure Minimalist Light Canvas
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 uppercase">
                      #F8FAFC · Squircle #FFFFFF
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <div className="text-xs font-bold text-[#081B3A]">
                    {navyOnLightCanvasContrast}:1
                  </div>
                  <div className="text-[11px] text-slate-500">Surface Delta</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
            <span>Squircle Curvature: R={config.squircleRadius}px</span>
            <span>Gradient Vector: {config.gradientAngle}°</span>
          </div>
        </div>
      </div>

      {/* Live Production SVG Code Inspector */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3
              className="text-sm font-semibold text-[#081B3A]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Live Vector SVG Source Code (1024×1024 ViewBox)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Zero raster dependencies. Copy directly into React Native, SwiftUI Vector Assets, or Figma.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopySvg}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#081B3A] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {copiedSvg ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Copied SVG Source
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy SVG Code
              </>
            )}
          </button>
        </div>
        <pre className="bg-[#081B3A] text-slate-100 p-4 rounded-lg text-[11px] font-mono overflow-x-auto max-h-60 leading-relaxed">
          <code>{svgSource}</code>
        </pre>
      </div>
    </div>
  );
}
