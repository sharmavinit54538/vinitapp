'use client';

import React, { useState } from 'react';
import {
  DEFAULT_ICON_CONFIG,
  ICON_PRESETS,
  IconConfig,
  getContrastRatio,
  serializeIconToSvgString,
} from '@/lib/icon-math';
import { Ofc360VectorIcon } from '@/components/ofc360-vector-icon';
import { DeviceContextPreviews } from '@/components/device-context-previews';
import { HrmsMobileSimulator } from '@/components/hrms-mobile-simulator';
import { ExportAndSpecsPanel } from '@/components/export-and-specs-panel';
import {
  Download,
  RotateCcw,
  Grid,
  Compass,
  Sliders,
  FileCode,
  Columns2,
} from 'lucide-react';

type ActiveSection = 'studio' | 'contexts' | 'simulator' | 'export';
type ArtboardViewMode = 'vector' | 'side-by-side';

export function BrandIconStudioWorkspace() {
  const [config, setConfig] = useState<IconConfig>(DEFAULT_ICON_CONFIG);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showAnatomy, setShowAnatomy] = useState<boolean>(false);
  const [artboardMode, setArtboardMode] =
    useState<ArtboardViewMode>('side-by-side');
  const [activeTab, setActiveTab] = useState<ActiveSection>('studio');
  const [lastExportMessage, setLastExportMessage] = useState<string | null>(
    null
  );

  const contrastRatio = getContrastRatio(config.deepNavy, '#FFFFFF');

  const handleSelectPreset = (preset: IconConfig) => {
    setConfig({ ...preset });
  };

  const handleResetToDefault = () => {
    setConfig({ ...DEFAULT_ICON_CONFIG });
    setShowGrid(false);
    setShowAnatomy(false);
    setLastExportMessage(
      'Reset to Official OFC360 Logo Specification (#081B3A → #0052FF squircle with 3D silver-white winged O + 360).'
    );
  };

  const handleExportSvg = () => {
    const svgString = serializeIconToSvgString(config, showGrid);
    const blob = new Blob([svgString], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OFC360-icon-${config.id}-1024x1024.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setLastExportMessage(
      `Exported vector master: OFC360-icon-${config.id}-1024x1024.svg (1024×1024 SVG)`
    );
  };

  const handleExportPng = (targetSize: number, label: string) => {
    const svgString = serializeIconToSvgString(config, false);
    const svgBlob = new Blob([svgString], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, targetSize, targetSize);
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            const pngUrl = URL.createObjectURL(pngBlob);
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = `OFC360-${label}-${targetSize}x${targetSize}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(pngUrl);
          }
        }, 'image/png');
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
    setLastExportMessage(
      `Rendered & exported high-fidelity PNG: OFC360-${label}-${targetSize}x${targetSize}.png (${targetSize}×${targetSize}px)`
    );
  };

  return (
    <div className="space-y-8" data-testid="brand-icon-studio-workspace">
      {/* Studio Sub-navigation & Export Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span>OFC360 Brand Identity</span>
            <span aria-hidden="true">·</span>
            <span>Parametric Vector Inspector</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">#081B3A → #0052FF</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-[#081B3A]"
            style={{
              fontFamily: 'var(--font-display)',
              textWrap: 'balance',
            }}
          >
            OFC360 Mobile App Icon &amp; Aerodynamic Vector System
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {[
              { id: 'studio', label: 'Icon Studio' },
              { id: 'contexts', label: 'OS Contexts' },
              { id: 'simulator', label: 'HRMS App Preview' },
              { id: 'export', label: 'Export & Specs' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ActiveSection)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#081B3A] text-white border-[#081B3A]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportSvg}
            className="px-3.5 py-2 text-xs font-semibold text-[#081B3A] bg-white border border-slate-200 hover:border-[#0052FF] rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <FileCode className="w-3.5 h-3.5 text-[#0052FF]" />
            Download Vector SVG
          </button>
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:text-[#081B3A] rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Spec
          </button>
        </div>
      </div>

      {lastExportMessage && activeTab !== 'export' && (
        <div
          role="status"
          data-testid="studio-status-banner"
          className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-[#081B3A] flex items-center justify-between gap-4"
        >
          <span className="font-medium">{lastExportMessage}</span>
          <button
            type="button"
            onClick={() => setLastExportMessage(null)}
            className="text-slate-400 hover:text-[#081B3A] text-xs font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {activeTab === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
                <span className="font-semibold text-[#081B3A]">
                  ARTBOARD 1024×1024PX
                </span>
                <span aria-hidden="true">·</span>
                <span>ROT {config.rotationAngle}°</span>
                <span aria-hidden="true">·</span>
                <span>OPACITY {config.iconOpacity}%</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setArtboardMode((m) =>
                      m === 'side-by-side' ? 'vector' : 'side-by-side'
                    )
                  }
                  aria-pressed={artboardMode === 'side-by-side'}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                    artboardMode === 'side-by-side'
                      ? 'bg-[#081B3A] text-white border-[#081B3A]'
                      : 'bg-[#F8FAFC] text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Columns2 className="w-3.5 h-3.5" />
                  Compare Official Logo
                </button>
                <button
                  type="button"
                  onClick={() => setShowGrid((g) => !g)}
                  aria-pressed={showGrid}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                    showGrid
                      ? 'bg-[#081B3A] text-white border-[#081B3A]'
                      : 'bg-[#F8FAFC] text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  HIG Keyline Grid
                </button>
                <button
                  type="button"
                  onClick={() => setShowAnatomy((a) => !a)}
                  aria-pressed={showAnatomy}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                    showAnatomy
                      ? 'bg-[#0052FF] text-white border-[#0052FF]'
                      : 'bg-[#F8FAFC] text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  Vector Anatomy
                </button>
              </div>
            </div>

            {artboardMode === 'side-by-side' ? (
              <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#F4F6F9] rounded-xl p-6 items-center">
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-[300px] aspect-square">
                    <Ofc360VectorIcon
                      config={config}
                      showGrid={showGrid}
                      showAnatomy={showAnatomy}
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <span>Interactive Vector SVG</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-[#0052FF]">
                      ROT {config.rotationAngle}° · {config.iconOpacity}%
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-full max-w-[300px] aspect-square rounded-2xl overflow-hidden flex items-center justify-center bg-[#F4F6F9]">
                    <img
                      src="/assets/aistudio/image_50b5b786.png"
                      alt="Official OFC360 Uploaded App Logo Reference"
                      referrerPolicy="no-referrer"
                      style={{
                        transform: `rotate(${config.rotationAngle || 0}deg)`,
                        opacity: (config.iconOpacity ?? 100) / 100,
                      }}
                      className="w-full h-full object-contain transition-all duration-150"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <span>Uploaded Brand Logo</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-500">
                      Reference Master
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="my-6 flex items-center justify-center bg-[#F4F6F9] rounded-xl p-6 sm:p-10">
                <div className="w-full max-w-[400px] aspect-square">
                  <Ofc360VectorIcon
                    config={config}
                    showGrid={showGrid}
                    showAnatomy={showAnatomy}
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {ICON_PRESETS.map((preset) => {
                  const isSelected = config.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2.5 rounded-lg text-left transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-[#0052FF]/10 text-[#081B3A] ring-1 ring-[#0052FF]'
                          : 'bg-[#F8FAFC] text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-[8px] overflow-hidden shrink-0">
                        <Ofc360VectorIcon config={preset} frameless />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">
                          {preset.name.replace(' Squircle', '')}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#0052FF]" />
                  <h2
                    className="text-base font-semibold text-[#081B3A]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Parametric Vector Inspector
                  </h2>
                </div>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  WCAG {contrastRatio}:1
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label
                    htmlFor="wing-sweep-slider"
                    className="font-medium text-slate-700"
                  >
                    Aerodynamic ‘F’ Wing Sweep
                  </label>
                  <span className="font-mono font-semibold text-[#0052FF] tabular-nums">
                    {config.wingSweep}%
                  </span>
                </div>
                <input
                  id="wing-sweep-slider"
                  type="range"
                  min={20}
                  max={100}
                  value={config.wingSweep}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      wingSweep: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-[#0052FF] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label
                    htmlFor="ring-thickness-slider"
                    className="font-medium text-slate-700"
                  >
                    Circular ‘O’ Stroke Weight
                  </label>
                  <span className="font-mono font-semibold text-[#081B3A] tabular-nums">
                    {config.ringThickness}px
                  </span>
                </div>
                <input
                  id="ring-thickness-slider"
                  type="range"
                  min={48}
                  max={84}
                  value={config.ringThickness}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      ringThickness: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-[#0052FF] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label
                    htmlFor="icon-rotation-slider"
                    className="font-medium text-slate-700"
                  >
                    Icon Rotation Angle (‘O’ &amp; Wing Orientation)
                  </label>
                  <span
                    data-testid="icon-rotation-value"
                    className="font-mono font-semibold text-[#0052FF] tabular-nums"
                  >
                    {config.rotationAngle}°
                  </span>
                </div>
                <input
                  id="icon-rotation-slider"
                  type="range"
                  min={0}
                  max={360}
                  value={config.rotationAngle}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      rotationAngle: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-[#0052FF] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label
                    htmlFor="icon-opacity-slider"
                    className="font-medium text-slate-700"
                  >
                    Icon Graphic Opacity (Watermark / Subtle Preview)
                  </label>
                  <span
                    data-testid="icon-opacity-value"
                    className="font-mono font-semibold text-[#0052FF] tabular-nums"
                  >
                    {config.iconOpacity}%
                  </span>
                </div>
                <input
                  id="icon-opacity-slider"
                  type="range"
                  min={50}
                  max={100}
                  value={config.iconOpacity}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      iconOpacity: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-[#0052FF] cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleExportPng(1024, 'AppStore-1024')}
                className="w-full py-2 px-4 text-xs font-semibold text-white bg-[#081B3A] hover:bg-[#0052FF] rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export 1024×1024 PNG
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'contexts' && (
        <DeviceContextPreviews config={config} onExportPng={handleExportPng} />
      )}
      {activeTab === 'simulator' && <HrmsMobileSimulator config={config} />}
      {activeTab === 'export' && (
        <ExportAndSpecsPanel
          config={config}
          includeGridInExport={showGrid}
          onExportSvg={handleExportSvg}
          onExportPng={handleExportPng}
          lastExportMessage={lastExportMessage}
        />
      )}
    </div>
  );
}
