'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Target,
  Award,
  Users,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  PieChart,
  Layers,
  ArrowUpRight,
  Briefcase
} from 'lucide-react';
import {
  GoalRecord,
  ReviewCycleRecord,
  PerformanceReviewRecord,
  PipRecord,
} from '../../types/performanceGoals';

interface ExecutivePerformanceViewProps {
  goals: GoalRecord[];
  reviewCycles: ReviewCycleRecord[];
  reviews: PerformanceReviewRecord[];
  pips: PipRecord[];
  onToast: (msg: string) => void;
}

export function ExecutivePerformanceView({
  goals,
  reviewCycles,
  reviews,
  pips,
  onToast,
}: ExecutivePerformanceViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'reviews' | 'reports'>('overview');

  const companyScore = 4.4;
  const companyGoalCompletion = 91;
  const totalEmployees = 142;
  const topTalentPct = 28;
  const flightRiskPct = 4;

  return (
    <div className="space-y-4 pb-20">
      {/* Executive Hero Banner */}
      <div
        className="rounded-2xl p-4 text-white shadow-sm"
        style={{ background: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Executive Leadership Cockpit</span>
            </div>
            <h2 className="text-lg font-bold mt-0.5 text-white">Company Performance</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Q4 FY24-25 Strategic Alignment & Talent Velocity
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block">Org Health Index</span>
            <span className="text-xl font-black text-amber-400">96.4%</span>
          </div>
        </div>

        {/* C-Suite Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-800 text-center">
          <div className="bg-zinc-900/60 rounded-xl p-2.5 border border-zinc-800">
            <p className="text-[10px] text-zinc-400">Company Score</p>
            <p className="text-base font-bold text-white mt-0.5">{companyScore} / 5.0</p>
            <span className="text-[9px] text-emerald-400 font-medium">Top Quartile</span>
          </div>
          <div className="bg-zinc-900/60 rounded-xl p-2.5 border border-zinc-800">
            <p className="text-[10px] text-zinc-400">OKR Delivery</p>
            <p className="text-base font-bold text-white mt-0.5">{companyGoalCompletion}%</p>
            <span className="text-[9px] text-amber-400 font-medium">12 Goals Active</span>
          </div>
          <div className="bg-zinc-900/60 rounded-xl p-2.5 border border-zinc-800">
            <p className="text-[10px] text-zinc-400">High Performers</p>
            <p className="text-base font-bold text-emerald-400 mt-0.5">{topTalentPct}%</p>
            <span className="text-[9px] text-zinc-400 font-medium">38 Leaders</span>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeTab === 'overview' ? 'bg-white text-zinc-900 font-bold shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeTab === 'analytics' ? 'bg-white text-zinc-900 font-bold shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          Talent Analytics
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeTab === 'reviews' ? 'bg-white text-zinc-900 font-bold shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          Review Cycles
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeTab === 'reports' ? 'bg-white text-zinc-900 font-bold shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          Board Reports
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Key Executive Insights */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-zinc-700" />
              Strategic Alignment & Business OKRs
            </h3>
            <div className="space-y-3">
              {[
                { title: 'ARR Growth: Achieve ₹50Cr ARR milestone', progress: 92, status: 'On Track', color: 'bg-emerald-500' },
                { title: 'Market Expansion: Launch Middle-East enterprise pod', progress: 85, status: 'On Track', color: 'bg-indigo-500' },
                { title: 'Operational Efficiency: Reduce client onboarding TAT to 4 days', progress: 68, status: 'At Risk', color: 'bg-amber-500' },
              ].map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 truncate max-w-[220px]">{item.title}</span>
                    <span className="font-bold text-slate-700">{item.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Performance Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-slate-800">Department Score Index</h3>
              <span className="text-[10px] text-slate-400">Scale: 1.0 - 5.0</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400">Engineering</p>
                <p className="text-base font-bold text-emerald-600 mt-0.5">4.6 ★</p>
                <p className="text-[9px] text-slate-500">38 HC • 94% on-track</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400">Sales & Revenue</p>
                <p className="text-base font-bold text-indigo-600 mt-0.5">4.4 ★</p>
                <p className="text-[9px] text-slate-500">29 HC • 90% quota hit</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400">Product & UX</p>
                <p className="text-base font-bold text-blue-600 mt-0.5">4.5 ★</p>
                <p className="text-[9px] text-slate-500">14 HC • High velocity</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400">Customer Success</p>
                <p className="text-base font-bold text-cyan-600 mt-0.5">4.2 ★</p>
                <p className="text-[9px] text-slate-500">22 HC • 98% CSAT</p>
              </div>
            </div>
          </div>

          {/* Succession & Flight Risk Alert */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Talent Risk & Succession Readiness
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl">
                <div>
                  <p className="font-bold text-amber-900">Key Role Flight Risk: 4 Critical Leaders</p>
                  <p className="text-[10px] text-amber-700">Retention stock refresh recommended</p>
                </div>
                <button
                  onClick={() => onToast('Opened Retention & ESOP grant review')}
                  className="px-2 py-1 bg-amber-600 text-white font-bold text-[10px] rounded-lg"
                >
                  Review
                </button>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <div>
                  <p className="font-bold text-emerald-900">Succession Pipeline: 82% Ready</p>
                  <p className="text-[10px] text-emerald-700">Backup identified for 14 VP/Director roles</p>
                </div>
                <button
                  onClick={() => onToast('Succession map displayed')}
                  className="px-2 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-lg"
                >
                  Map
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-indigo-600" />
              Talent Rating Distribution (Bell Curve)
            </h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-700">Top Tier (Rating 4.5 - 5.0)</span>
                  <span className="font-bold text-emerald-600">38 Employees (27%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '27%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-700">Core Performers (Rating 3.5 - 4.4)</span>
                  <span className="font-bold text-indigo-600">82 Employees (58%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '58%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-700">Developing (Rating 2.8 - 3.4)</span>
                  <span className="font-bold text-amber-600">18 Employees (12%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '12%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-700">At-Risk / Action (Below 2.8)</span>
                  <span className="font-bold text-rose-600">4 Employees (3%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '3%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REVIEW CYCLES */}
      {activeTab === 'reviews' && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 mb-2">Company Appraisal Cycle Overview</h3>
            <p className="text-[10px] text-slate-500 mb-3">Monitoring completion across executive pods</p>
            <div className="space-y-3">
              {reviewCycles.map((c) => (
                <div key={c.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{c.title}</span>
                    <span className="font-bold text-indigo-600">{c.completionRate ?? c.completionRatePct ?? 80}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${c.completionRate ?? c.completionRatePct ?? 80}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 mb-1">Executive Board Reports</h3>
            <p className="text-[10px] text-slate-500 mb-3">Download high-level executive summaries</p>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => onToast('Exported Executive_Board_Deck_Summary.pdf')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-indigo-600" />
                  <div className="text-left">
                    <p className="font-bold text-slate-800">Q4 Board Deck Talent Summary</p>
                    <p className="text-[10px] text-slate-400">PDF • 12 Pages with benchmark comparisons</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onToast('Exported Succession_Risk_Assessment.csv')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <div className="text-left">
                    <p className="font-bold text-slate-800">Executive Succession & Flight Risk</p>
                    <p className="text-[10px] text-slate-400">CSV • Leadership pipeline breakdown</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
