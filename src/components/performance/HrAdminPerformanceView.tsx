'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Target,
  Award,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  Sliders,
  Settings,
  Flame,
  ArrowUpRight,
  FileSpreadsheet,
  Plus,
  Compass,
  FileCheck2,
  Eye,
  Check
} from 'lucide-react';
import {
  GoalRecord,
  KpiRecord,
  ReviewCycleRecord,
  PerformanceReviewRecord,
  Feedback360Record,
  PipRecord,
  DevelopmentPlanRecord,
  PerformanceActivityLog,
} from '../../types/performanceGoals';

interface HrAdminPerformanceViewProps {
  goals: GoalRecord[];
  kpis: KpiRecord[];
  reviewCycles: ReviewCycleRecord[];
  reviews: PerformanceReviewRecord[];
  feedbacks: Feedback360Record[];
  pips: PipRecord[];
  devPlans: DevelopmentPlanRecord[];
  activityLogs: PerformanceActivityLog[];
  onOpenCreateGoal: () => void;
  onOpenCreateReviewCycle?: () => void;
  onUpdateReviewStatus?: (reviewId: string, status: PerformanceReviewRecord['status']) => void;
  onToast: (msg: string) => void;
}

export function HrAdminPerformanceView({
  goals,
  kpis,
  reviewCycles,
  reviews,
  feedbacks,
  pips,
  devPlans,
  activityLogs,
  onOpenCreateGoal,
  onToast,
}: HrAdminPerformanceViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'kpis' | 'cycles' | 'tools'>('overview');
  const [selectedTool, setSelectedTool] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [activePipFilter, setActivePipFilter] = useState<'All' | 'Active' | 'Completed'>('All');

  // Stats
  const totalEmployees = 142;
  const avgOrgScore = 4.3;
  const activeCycle = reviewCycles.find((c) => c.status === 'Active') || reviewCycles[0];
  const pendingReviews = reviews.filter((r) => r.status !== 'Finalized').length;
  const completedReviews = reviews.filter((r) => r.status === 'Finalized').length;
  const completionRate = reviews.length ? Math.round((completedReviews / reviews.length) * 100) : 78;

  // 16 Admin Tools List
  const adminTools = [
    { id: 'dashboard', name: '1. Executive Dashboard', icon: BarChart3, count: '142 Staff' },
    { id: 'goals_repo', name: '2. Goal Repository', icon: Target, count: `${goals.length} Goals` },
    { id: 'kpi_library', name: '3. KPI Master Library', icon: Award, count: `${kpis.length} KPIs` },
    { id: 'review_cycles', name: '4. Cycle Scheduler', icon: Calendar, count: `${reviewCycles.length} Cycles` },
    { id: 'feedback_config', name: '5. 360 Feedback Setup', icon: Sparkles, count: `${feedbacks.length} Praises` },
    { id: 'calibration_matrix', name: '6. 9-Box Calibration', icon: Layers, count: 'Active' },
    { id: 'promotions', name: '7. Promotion Nominations', icon: ArrowUpRight, count: '6 Pending' },
    { id: 'appraisals', name: '8. Appraisal Management', icon: FileCheck2, count: `${reviews.length} Active` },
    { id: 'pip_management', name: '9. PIP Governance', icon: ShieldAlert, count: `${pips.length} Staff` },
    { id: 'dev_plans', name: '10. Development Plans', icon: Compass, count: `${devPlans.length} Plans` },
    { id: 'rewards', name: '11. Recognition & Rewards', icon: Flame, count: '₹1.4L Pool' },
    { id: 'competency', name: '12. Competency Framework', icon: CheckCircle2, count: '18 Traits' },
    { id: 'bell_curve', name: '13. Bell Curve Normalization', icon: Sliders, count: 'Normalizing' },
    { id: 'dept_performance', name: '14. Dept Performance', icon: Users, count: '6 Depts' },
    { id: 'reports', name: '15. Export & Analytics', icon: FileSpreadsheet, count: 'PDF / CSV' },
    { id: 'audit_log', name: '16. Audit Log & History', icon: Clock, count: `${activityLogs.length} Events` },
  ];

  const filteredGoals = goals.filter((g) => {
    const owner = g.ownerName || g.employeeName || '';
    const matchSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = deptFilter === 'All' || g.department === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* HR Admin Header Banner */}
      <div className="rounded-2xl p-4 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-200">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-300" />
              <span>HR Talent & Appraisal Office</span>
            </div>
            <h2 className="text-lg font-bold mt-0.5 text-white">HR Performance Center</h2>
            <p className="text-xs text-indigo-200 mt-0.5">
              Cycle: {activeCycle?.title || 'Q4 2024 Appraisal'} ({activeCycle?.status || 'Active'})
            </p>
          </div>
          <button
            onClick={onOpenCreateGoal}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-white text-indigo-900 rounded-xl shadow active:scale-95 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Goal</span>
          </button>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-indigo-400/30 text-center">
          <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
            <p className="text-[10px] text-indigo-200">Org Avg Score</p>
            <p className="text-base font-bold text-white mt-0.5">{avgOrgScore} / 5.0</p>
            <span className="text-[9px] text-emerald-300 font-medium">+0.3 vs LY</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
            <p className="text-[10px] text-indigo-200">Reviews Done</p>
            <p className="text-base font-bold text-white mt-0.5">{completionRate}%</p>
            <span className="text-[9px] text-indigo-200 font-medium">{pendingReviews} pending</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
            <p className="text-[10px] text-indigo-200">On Active PIP</p>
            <p className="text-base font-bold text-amber-300 mt-0.5">{pips.filter(p => p.status === 'Active').length}</p>
            <span className="text-[9px] text-indigo-200 font-medium">Monitoring</span>
          </div>
        </div>
      </div>

      {/* Primary HR Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-center transition-all ${
            activeTab === 'overview' ? 'bg-white text-indigo-600 font-bold shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-lg text-center transition-all ${
            activeTab === 'goals' ? 'bg-white text-indigo-600 font-bold shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          Goals ({goals.length})
        </button>
        <button
          onClick={() => setActiveTab('kpis')}
          className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-center transition-all ${
            activeTab === 'kpis' ? 'bg-white text-indigo-600 font-bold shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          KPIs ({kpis.length})
        </button>
        <button
          onClick={() => setActiveTab('cycles')}
          className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-lg text-center transition-all ${
            activeTab === 'cycles' ? 'bg-white text-indigo-600 font-bold shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          Cycles ({reviewCycles.length})
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex-1 min-w-[85px] py-1.5 px-2 rounded-lg text-center transition-all ${
            activeTab === 'tools' ? 'bg-white text-indigo-600 font-bold shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          16 Tools ★
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Active Review Cycle Progress Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  Q4
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">{activeCycle?.title}</h3>
                  <p className="text-[10px] text-slate-400">Ends: {activeCycle?.endDate}</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {completionRate}% Completed
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${completionRate}%` }} />
            </div>

            <div className="grid grid-cols-4 gap-2 text-center mt-3 pt-3 border-t border-slate-100 text-[10px]">
              <div>
                <p className="text-slate-400">Total Staff</p>
                <p className="font-bold text-slate-700">{totalEmployees}</p>
              </div>
              <div>
                <p className="text-slate-400">Self Done</p>
                <p className="font-bold text-emerald-600">118</p>
              </div>
              <div>
                <p className="text-slate-400">Mgr Done</p>
                <p className="font-bold text-blue-600">92</p>
              </div>
              <div>
                <p className="text-slate-400">Finalized</p>
                <p className="font-bold text-purple-600">{completedReviews}</p>
              </div>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                Department Performance Benchmarks
              </h3>
              <span className="text-[10px] text-slate-400">Target: 4.0+</span>
            </div>

            <div className="space-y-2.5">
              {[
                { name: 'Engineering', score: 4.6, count: '38 members', color: 'bg-emerald-500', bar: '92%' },
                { name: 'Product', score: 4.4, count: '14 members', color: 'bg-indigo-500', bar: '88%' },
                { name: 'Sales & BD', score: 4.2, count: '29 members', color: 'bg-blue-500', bar: '84%' },
                { name: 'Customer Success', score: 4.1, count: '22 members', color: 'bg-cyan-500', bar: '82%' },
                { name: 'Human Resources', score: 4.5, count: '12 members', color: 'bg-purple-500', bar: '90%' },
                { name: 'Finance & Ops', score: 3.9, count: '17 members', color: 'bg-amber-500', bar: '78%' },
              ].map((dept, idx) => (
                <div key={idx} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700">{dept.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{dept.count}</span>
                      <span className="font-bold text-indigo-600">{dept.score} ★</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${dept.color}`} style={{ width: dept.bar }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers vs PIP Alerts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Top Star Performers</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="bg-white p-2 rounded-xl shadow-xs border border-emerald-100">
                  <p className="font-bold text-slate-800">Aarav Sharma</p>
                  <p className="text-[9px] text-slate-400">Frontend Lead • 4.8 ★</p>
                </div>
                <div className="bg-white p-2 rounded-xl shadow-xs border border-emerald-100">
                  <p className="font-bold text-slate-800">Rhea Sen</p>
                  <p className="text-[9px] text-slate-400">Product Manager • 4.7 ★</p>
                </div>
              </div>
            </div>

            <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs mb-2">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>PIP Governance</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="bg-white p-2 rounded-xl shadow-xs border border-rose-100">
                  <p className="font-bold text-slate-800">Vikram Nair</p>
                  <p className="text-[9px] text-amber-600 font-semibold">Day 28 of 60 • Mid-Review</p>
                </div>
                <div className="bg-white p-2 rounded-xl shadow-xs border border-rose-100">
                  <p className="font-bold text-slate-800">Sanjay Gupta</p>
                  <p className="text-[9px] text-emerald-600 font-semibold">Exited PIP (Success)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts to Popular Admin Actions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-800 mb-2.5">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setSelectedTool('calibration_matrix');
                  setActiveTab('tools');
                }}
                className="flex items-center gap-2 p-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-medium text-left hover:bg-indigo-100"
              >
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>9-Box Calibration</span>
              </button>
              <button
                onClick={() => {
                  setSelectedTool('promotions');
                  setActiveTab('tools');
                }}
                className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-medium text-left hover:bg-emerald-100"
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                <span>Approve Promotions</span>
              </button>
              <button
                onClick={() => {
                  setSelectedTool('reports');
                  setActiveTab('tools');
                }}
                className="flex items-center gap-2 p-2.5 bg-blue-50 text-blue-700 rounded-xl font-medium text-left hover:bg-blue-100"
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>Export Report (CSV)</span>
              </button>
              <button
                onClick={() => {
                  onToast('Notification reminder dispatched to 34 pending managers.');
                }}
                className="flex items-center gap-2 p-2.5 bg-amber-50 text-amber-700 rounded-xl font-medium text-left hover:bg-amber-100"
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Nudge Evaluators</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GOALS & OKRS */}
      {activeTab === 'goals' && (
        <div className="space-y-3">
          {/* Search & Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search goals or owners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 focus:outline-none"
            >
              <option value="All">All Depts</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Sales & BD">Sales</option>
              <option value="HR & Talent">HR</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing {filteredGoals.length} goals</span>
            <button
              onClick={onOpenCreateGoal}
              className="text-indigo-600 font-bold flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Org Goal</span>
            </button>
          </div>

          {/* Goals List */}
          <div className="space-y-2.5">
            {filteredGoals.map((g) => (
              <div key={g.id} className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {g.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 mt-1">{g.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Owner: <span className="font-semibold text-slate-700">{g.ownerName || g.employeeName}</span> ({g.department})
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      g.status === 'On Track'
                        ? 'bg-emerald-100 text-emerald-700'
                        : g.status === 'At Risk'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {g.status}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Overall Progress</span>
                    <span className="font-bold text-slate-700">{g.progress ?? g.progressPercentage ?? 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        g.status === 'At Risk' ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${g.progress ?? g.progressPercentage ?? 0}%` }}
                    />
                  </div>
                </div>

                {g.keyResults && g.keyResults.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Key Results ({g.keyResults.length})
                    </p>
                    {g.keyResults.slice(0, 2).map((kr) => (
                      <div key={kr.id} className="flex justify-between items-center text-[10px] text-slate-600">
                        <span className="truncate max-w-[200px]">• {kr.title}</span>
                        <span className="font-semibold text-slate-700">{kr.currentValue}/{kr.targetValue} {kr.unit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: KPIS MASTER LIBRARY */}
      {activeTab === 'kpis' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <div>
              <h3 className="text-xs font-bold text-slate-800">Organizational KPI Library</h3>
              <p className="text-[10px] text-slate-500">Standard indicators linked to appraisal scoring</p>
            </div>
            <button
              onClick={() => onToast('New KPI Template created.')}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-xl hover:bg-indigo-100"
            >
              + Add KPI
            </button>
          </div>

          <div className="space-y-2.5">
            {kpis.map((kpi) => (
              <div key={kpi.id} className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {kpi.department}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 mt-1">{kpi.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{kpi.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-indigo-600">
                      {kpi.actual} / {kpi.target} {kpi.unit}
                    </span>
                    <p className="text-[9px] text-slate-400">Weight: {kpi.weightage}%</p>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{
                      width: `${Math.min(100, Math.round((kpi.actual / kpi.target) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REVIEW CYCLES */}
      {activeTab === 'cycles' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <div>
              <h3 className="text-xs font-bold text-slate-800">Appraisal & Review Cycles</h3>
              <p className="text-[10px] text-slate-500">Scheduled annual, bi-annual & quarterly cycles</p>
            </div>
            <button
              onClick={() => onToast('Review Cycle Wizard opened (frontend mock).')}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-xl hover:bg-indigo-100"
            >
              + Launch Cycle
            </button>
          </div>

          <div className="space-y-2.5">
            {reviewCycles.map((cycle) => (
              <div key={cycle.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          cycle.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cycle.status}
                      </span>
                      <span className="text-[10px] text-slate-400">{cycle.frequency} Cycle</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 mt-1">{cycle.title}</h4>
                    <p className="text-[10px] text-slate-500">
                      {cycle.startDate} to {cycle.endDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-indigo-600">{cycle.completionRate}%</span>
                    <p className="text-[9px] text-slate-400">{cycle.totalReviews} Evaluated</p>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${cycle.completionRate}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400">Stages: Self → Mgr → Calibration</span>
                  <button
                    onClick={() => onToast(`Managing ${cycle.title}`)}
                    className="text-indigo-600 font-bold hover:underline text-[11px]"
                  >
                    Manage Rollout →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: 16 ADMINISTRATIVE TOOLS */}
      {activeTab === 'tools' && (
        <div className="space-y-3">
          {/* Tool Selector Dropdown / Pills */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Select HR Administration Tool
            </label>
            <select
              value={selectedTool}
              onChange={(e) => setSelectedTool(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {adminTools.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.count})
                </option>
              ))}
            </select>
          </div>

          {/* DYNAMIC SUB-VIEW FOR SELECTED TOOL */}
          {selectedTool === 'calibration_matrix' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">9-Box Calibration Grid</h3>
                  <p className="text-[10px] text-slate-500">Performance vs Potential Matrix</p>
                </div>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                  142 Employees Plotted
                </span>
              </div>

              {/* 9 Box Visual Mock */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                <div className="bg-blue-50 border border-blue-200 p-2 rounded-xl">
                  <p className="font-bold text-blue-900">Enigma</p>
                  <p className="text-[9px] text-blue-600 font-medium">8 Staff</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl">
                  <p className="font-bold text-emerald-900">High Potential</p>
                  <p className="text-[9px] text-emerald-600 font-medium">24 Staff</p>
                </div>
                <div className="bg-indigo-100 border border-indigo-300 p-2 rounded-xl shadow-xs">
                  <p className="font-bold text-indigo-950">★ Star Leader</p>
                  <p className="text-[9px] text-indigo-700 font-bold">16 Staff</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl">
                  <p className="font-bold text-slate-800">Dilemma</p>
                  <p className="text-[9px] text-slate-500">12 Staff</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 p-2 rounded-xl">
                  <p className="font-bold text-indigo-900">Core Player</p>
                  <p className="text-[9px] text-indigo-600">48 Staff</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl">
                  <p className="font-bold text-emerald-900">High Performer</p>
                  <p className="text-[9px] text-emerald-600">22 Staff</p>
                </div>

                <div className="bg-rose-50 border border-rose-200 p-2 rounded-xl">
                  <p className="font-bold text-rose-900">Risk / Action</p>
                  <p className="text-[9px] text-rose-600 font-bold">4 Staff (PIP)</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-2 rounded-xl">
                  <p className="font-bold text-amber-900">Effective</p>
                  <p className="text-[9px] text-amber-600">6 Staff</p>
                </div>
                <div className="bg-teal-50 border border-teal-200 p-2 rounded-xl">
                  <p className="font-bold text-teal-900">Trusted Pro</p>
                  <p className="text-[9px] text-teal-600">2 Staff</p>
                </div>
              </div>

              <button
                onClick={() => onToast('Calibration Lock applied to Q4 cycle.')}
                className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Save & Lock Calibration Ratings
              </button>
            </div>
          )}

          {selectedTool === 'pip_management' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Performance Improvement Plans</h3>
                  <p className="text-[10px] text-slate-500">HR Legal & Performance Governance</p>
                </div>
                <button
                  onClick={() => onToast('Initiate PIP Form opened.')}
                  className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg"
                >
                  + Issue PIP
                </button>
              </div>

              <div className="space-y-2">
                {pips.map((p) => (
                  <div key={p.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                          {p.durationDays} Days Plan
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 mt-1">{p.employeeName}</h4>
                        <p className="text-[10px] text-slate-500">Dept: {p.department} • Mentor: {p.mentorName}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.status === 'Active' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                      Reason: {p.reason}
                    </p>
                    <div className="flex justify-between items-center text-[10px] pt-1">
                      <span className="text-slate-400">Review Date: {p.reviewDate}</span>
                      <button
                        onClick={() => onToast(`Viewing weekly checklist for ${p.employeeName}`)}
                        className="text-indigo-600 font-bold hover:underline"
                      >
                        View Checklist ({p.milestones?.length || p.actionPlan?.length || 4}) →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTool === 'promotions' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Promotion Nominations Queue</h3>
                  <p className="text-[10px] text-slate-500">Manager recommended promotions for Q4</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  6 Nominations
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'Aarav Sharma', current: 'Senior Frontend Eng', proposed: 'Staff Engineer', score: '4.8', mgr: 'Rajesh K.' },
                  { name: 'Rhea Sen', current: 'Associate PM', proposed: 'Product Manager I', score: '4.7', mgr: 'Dev V.' },
                  { name: 'Kavita Iyer', current: 'Sales Specialist', proposed: 'Enterprise Account Exec', score: '4.6', mgr: 'Ananya S.' },
                ].map((promo, i) => (
                  <div key={i} className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{promo.name}</h4>
                      <p className="text-[10px] text-slate-500">
                        {promo.current} → <span className="font-bold text-indigo-700">{promo.proposed}</span>
                      </p>
                      <p className="text-[9px] text-slate-400">Score: {promo.score} ★ • Nominated by {promo.mgr}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => onToast(`Endorsed promotion for ${promo.name}`)}
                        className="text-[10px] font-bold px-2.5 py-1 bg-emerald-600 text-white rounded-lg shadow-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onToast(`Deferred nomination for ${promo.name}`)}
                        className="text-[10px] font-medium px-2 py-0.5 bg-slate-200 text-slate-600 rounded-lg"
                      >
                        Defer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTool === 'rewards' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Recognition & Rewards Pool</h3>
                  <p className="text-[10px] text-slate-500">Quarterly spot bonuses and peer points budget</p>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  ₹1,40,000 Pool
                </span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-bold text-amber-900">Total Kudos Granted This Quarter: 342</p>
                <p className="text-[10px] text-amber-700 mt-0.5">Top Category: &quot;Client Obsession &amp; Speed&quot;</p>
              </div>
              <button
                onClick={() => onToast('Spot bonus disbursement batch approved.')}
                className="w-full py-2 bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Approve Disbursal Batch (₹45,000)
              </button>
            </div>
          )}

          {selectedTool === 'bell_curve' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800">Forced Ranking / Bell Curve</h3>
                <p className="text-[10px] text-slate-500">Target vs Actual Normalization Distribution</p>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-bold text-emerald-700">Band 1 (Outstanding 5★): Target 10%</span>
                    <span className="font-bold text-slate-700">Actual: 12%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '12%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-bold text-indigo-700">Band 2 (Exceeds 4★): Target 25%</span>
                    <span className="font-bold text-slate-700">Actual: 27%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '27%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-bold text-blue-700">Band 3 (Meets 3★): Target 50%</span>
                    <span className="font-bold text-slate-700">Actual: 48%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '48%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-bold text-amber-700">Band 4 (Needs Imp. 2★): Target 10%</span>
                    <span className="font-bold text-slate-700">Actual: 9%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '9%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-bold text-rose-700">Band 5 (Unsatisfactory 1★): Target 5%</span>
                    <span className="font-bold text-slate-700">Actual: 4%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '4%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTool === 'reports' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800">HR Analytics & Compliance Export</h3>
                <p className="text-[10px] text-slate-500">Download sanitized reports for leadership</p>
              </div>
              <div className="space-y-2 text-xs">
                <button
                  onClick={() => onToast('Generating Q4_Appraisal_Consolidated.csv...')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <div className="text-left">
                      <p className="font-bold text-slate-800">Appraisal Consolidated Master</p>
                      <p className="text-[10px] text-slate-400">Scores, ratings, promotion status (.CSV)</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => onToast('Generating OKR_Achievement_Audit.pdf...')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <div className="text-left">
                      <p className="font-bold text-slate-800">Org OKR Achievement Report</p>
                      <p className="text-[10px] text-slate-400">Quarterly progress and KR audits (.PDF)</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          )}

          {selectedTool === 'audit_log' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800">HR Governance Audit Trail</h3>
                <p className="text-[10px] text-slate-500">Tamper-proof record of performance adjustments</p>
              </div>
              <div className="space-y-2">
                {activityLogs.map((log) => (
                  <div key={log.id} className="p-2.5 border border-slate-100 rounded-xl bg-slate-50 text-[10px] space-y-0.5">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-700">{log.userName} ({log.userRole})</span>
                      <span className="text-slate-400">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-600">{log.action}: <span className="font-medium">{log.details}</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fallback for other tools */}
          {['dashboard', 'goals_repo', 'kpi_library', 'review_cycles', 'feedback_config', 'appraisals', 'dev_plans', 'competency'].includes(selectedTool) && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center py-6">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                <Settings className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">
                {adminTools.find(t => t.id === selectedTool)?.name}
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[240px] mx-auto">
                Configured with standard enterprise OFC360 security and live data synchronization.
              </p>
              <button
                onClick={() => onToast(`Exported snapshot for ${selectedTool}`)}
                className="mt-3 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl"
              >
                Trigger Sync & Export
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
