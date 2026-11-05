'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Workflow,
  Cpu,
  BarChart3,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export function Ofc360VisualShowcase() {
  return (
    <section
      aria-label="OFC360 Platform Overview"
      className="relative w-full lg:w-[55%] bg-[#060D1F] text-white overflow-hidden flex flex-col justify-between px-6 py-6 sm:p-12 xl:p-16 select-none"
    >
      {/* Subtle Ambient Gradient & Mesh Lighting (Blue, Indigo & Violet Accents) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full opacity-35 blur-[110px]"
          style={{
            background:
              'radial-gradient(circle, #2563EB 0%, #1D4ED8 45%, transparent 75%)',
          }}
        />
        <div
          className="absolute top-1/3 -right-28 w-[480px] h-[480px] rounded-full opacity-30 blur-[120px]"
          style={{
            background:
              'radial-gradient(circle, #6366F1 0%, #7C3AED 50%, transparent 75%)',
          }}
        />
        <div
          className="absolute -bottom-32 left-1/4 w-[540px] h-[420px] rounded-full opacity-25 blur-[110px]"
          style={{
            background:
              'radial-gradient(circle, #3B82F6 0%, #4F46E5 55%, transparent 80%)',
          }}
        />

        {/* Subtle Architectural Isometric Grid Overlay */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.07]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="ofc360-grid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="#93C5FD"
                strokeWidth="0.75"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ofc360-grid)" />
        </svg>
      </div>

      {/* Top Row: OFC360 Official Logo & Brand Identity */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] overflow-hidden bg-white/10 p-0.5 shadow-[0_4px_20px_rgba(37,99,235,0.35)] ring-1 ring-white/20 shrink-0">
            <img
              src="/assets/aistudio/image_50b5b786.png"
              alt="OFC360 Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
          <div>
            <span
              className="text-base sm:text-lg font-bold tracking-tight text-white block leading-none"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              OFC360
            </span>
            <span className="text-[11px] sm:text-xs text-blue-200/80 font-medium tracking-wide block mt-1">
              Office Function Consolidator
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: Hero Headline, Supporting Copy & Abstract 3D Enterprise Visual */}
      <div className="relative z-10 my-auto py-4 sm:py-6 space-y-6 sm:space-y-8 max-w-2xl">
        <div className="space-y-2.5 sm:space-y-4">
          <h1
            className="text-2xl sm:text-4xl xl:text-[42px] font-bold tracking-tight text-white leading-[1.15]"
            style={{
              fontFamily: 'var(--font-display)',
              textWrap: 'balance',
            }}
          >
            One Platform. Every Workplace Function.
          </h1>
          <p className="text-xs sm:text-base text-slate-300/90 leading-relaxed max-w-xl font-normal">
            Simplify workforce management, automate HR operations, and empower your organization with intelligent technology.
          </p>
        </div>

        {/* Abstract 3D Enterprise Spatial Visual (Hidden on small mobile screens, full fidelity on tablet/desktop) */}
        <div
          aria-hidden="true"
          className="hidden sm:block relative w-full pt-1"
        >
          <div className="relative w-full h-[310px] xl:h-[340px] rounded-2xl border border-white/12 bg-[#09142C]/85 shadow-[0_24px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] overflow-hidden p-6">
            {/* 3D Orbital SVG Mesh & Data Conduits */}
            <svg
              viewBox="0 0 680 320"
              className="absolute inset-0 w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="orbital-ring-grad"
                  x1="80"
                  y1="40"
                  x2="600"
                  y2="280"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.55" />
                  <stop offset="50%" stopColor="#818CF8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.55" />
                </linearGradient>

                <linearGradient
                  id="core-prism-grad"
                  x1="280"
                  y1="95"
                  x2="400"
                  y2="225"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="55%" stopColor="#4F46E5" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>

                <radialGradient id="core-halo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#6366F1" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Soft Central Volumetric Halo */}
              <circle cx="340" cy="160" r="135" fill="url(#core-halo)" />

              {/* 3D Isometric Perspective Rings */}
              <ellipse
                cx="340"
                cy="160"
                rx="235"
                ry="86"
                transform="rotate(-8 340 160)"
                stroke="url(#orbital-ring-grad)"
                strokeWidth="1.25"
                strokeDasharray="6 6"
              />
              <ellipse
                cx="340"
                cy="160"
                rx="172"
                ry="64"
                transform="rotate(11 340 160)"
                stroke="url(#orbital-ring-grad)"
                strokeWidth="1.25"
              />
              <ellipse
                cx="340"
                cy="160"
                rx="112"
                ry="42"
                transform="rotate(-4 340 160)"
                stroke="#93C5FD"
                strokeOpacity="0.3"
                strokeWidth="1"
              />

              {/* Curved Neural & Workflow Data Conduits connecting 4 Nodes to Central Core */}
              <path
                d="M 145 78 C 225 78, 255 135, 340 160"
                stroke="url(#orbital-ring-grad)"
                strokeWidth="1.75"
              />
              <path
                d="M 535 78 C 455 78, 425 135, 340 160"
                stroke="url(#orbital-ring-grad)"
                strokeWidth="1.75"
              />
              <path
                d="M 145 244 C 225 244, 255 185, 340 160"
                stroke="url(#orbital-ring-grad)"
                strokeWidth="1.75"
              />
              <path
                d="M 535 244 C 455 244, 425 185, 340 160"
                stroke="url(#orbital-ring-grad)"
                strokeWidth="1.75"
              />

              {/* Glowing Telemetry Nodes along Conduits */}
              <circle cx="225" cy="108" r="3.5" fill="#60A5FA" />
              <circle cx="455" cy="108" r="3.5" fill="#A78BFA" />
              <circle cx="225" cy="212" r="3.5" fill="#818CF8" />
              <circle cx="455" cy="212" r="3.5" fill="#38BDF8" />

              {/* Central 3D Isometric Layered Cube / Prism Platform */}
              <polygon
                points="340,214 404,182 340,150 276,182"
                fill="#1E293B"
                fillOpacity="0.85"
                stroke="#60A5FA"
                strokeOpacity="0.4"
                strokeWidth="1.2"
              />
              <polygon
                points="340,198 404,166 340,134 276,166"
                fill="#1E3A8A"
                fillOpacity="0.7"
                stroke="#93C5FD"
                strokeOpacity="0.5"
                strokeWidth="1.2"
              />
              <polygon
                points="340,182 404,150 340,118 276,150"
                fill="url(#core-prism-grad)"
                stroke="#E0E7FF"
                strokeOpacity="0.75"
                strokeWidth="1.5"
              />
            </svg>

            {/* Central Floating 360° Core Emblem */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] p-0.5 shadow-[0_12px_32px_rgba(59,130,246,0.55)] ring-1 ring-white/40 flex items-center justify-center">
                  <div className="w-full h-full rounded-[14px] bg-[#081B3A] flex flex-col items-center justify-center">
                    <Sparkles className="w-4 h-4 text-blue-300 mb-0.5" />
                    <span className="text-xs font-extrabold tracking-tight text-white font-mono">
                      360°
                    </span>
                  </div>
                </div>
                <span className="mt-2 text-[11px] font-semibold tracking-wide text-blue-100 bg-[#0B1736]/95 border border-white/15 px-2.5 py-0.5 rounded-md shadow-sm">
                  OFC360 Core Engine
                </span>
              </motion.div>
            </div>

            {/* 4 Spatial Glassmorphic Enterprise Function Cards */}
            <div className="relative z-10 h-full flex flex-col justify-between">
              {/* Top Pair: Connected Workforce + Workflow Automation */}
              <div className="flex items-start justify-between gap-4">
                <motion.div
                  animate={{ y: [0, -3.5, 0] }}
                  transition={{
                    duration: 4.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-[228px] rounded-xl bg-[#0D1B38]/90 border border-white/15 p-3 shadow-lg"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white whitespace-nowrap">
                        Connected Workforce
                      </div>
                      <div className="text-[11px] text-blue-200/80 whitespace-nowrap">
                        Unified People Directory
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 3.5, 0] }}
                  transition={{
                    duration: 4.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-[228px] rounded-xl bg-[#0D1B38]/90 border border-white/15 p-3 shadow-lg"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                      <Workflow className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white whitespace-nowrap">
                        Workflow Automation
                      </div>
                      <div className="text-[11px] text-indigo-200/80 whitespace-nowrap">
                        Autonomous HR Approvals
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom Pair: Intelligent HR Core + Business Intelligence */}
              <div className="flex items-end justify-between gap-4">
                <motion.div
                  animate={{ y: [0, 3.5, 0] }}
                  transition={{
                    duration: 5.1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-[228px] rounded-xl bg-[#0D1B38]/90 border border-white/15 p-3 shadow-lg"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-violet-300 shrink-0">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white whitespace-nowrap">
                        Intelligent HR Core
                      </div>
                      <div className="text-[11px] text-violet-200/80 whitespace-nowrap">
                        Smart Policy &amp; Compliance
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -3.5, 0] }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-[228px] rounded-xl bg-[#0D1B38]/90 border border-white/15 p-3 shadow-lg"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white whitespace-nowrap">
                        Business Intelligence
                      </div>
                      <div className="text-[11px] text-sky-200/80 whitespace-nowrap">
                        Real-Time 360° Analytics
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Small Trust Tagline */}
      <div className="relative z-10 flex items-center justify-between gap-4 pt-3 sm:pt-4 border-t border-white/10 text-xs text-slate-300/85">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
          <span>Trusted technology for smarter workplaces.</span>
        </div>
        <span className="hidden sm:inline text-slate-400 font-mono text-[11px]">
          OFC360 Enterprise Suite
        </span>
      </div>
    </section>
  );
}
