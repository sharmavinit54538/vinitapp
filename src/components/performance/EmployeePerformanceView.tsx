'use client';

import React, { useState } from 'react';
import {
  Target,
  Award,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  ChevronRight,
  BookOpen,
  Star,
  UserCheck,
  Zap,
  BarChart3,
  Calendar,
  FileText,
} from 'lucide-react';
import {
  DevelopmentPlanRecord,
  Feedback360Record,
  GoalRecord,
  KpiRecord,
  PerformanceReviewRecord,
} from '../../types/performanceGoals';
import { computeEmployeePerformanceScore } from '../../services/performance/performanceEngine';

interface EmployeePerformanceViewProps {
  goals: GoalRecord[];
  kpis: KpiRecord[];
  reviews: PerformanceReviewRecord[];
  feedbacks: Feedback360Record[];
  developmentPlans: DevelopmentPlanRecord[];
  activeSubTab: string;
  onSelectSubTab: (tab: string) => void;
  onCreateGoal: () => void;
  onUpdateGoalProgress: (goal: GoalRecord) => void;
  onOpenSelfAssessment: (review: PerformanceReviewRecord) => void;
  onOpenFeedbackModal: () => void;
}

export const EmployeePerformanceView: React.FC<EmployeePerformanceViewProps> = ({
  goals,
  kpis,
  reviews,
  feedbacks,
  developmentPlans,
  activeSubTab,
  onSelectSubTab,
  onCreateGoal,
  onUpdateGoalProgress,
  onOpenSelfAssessment,
  onOpenFeedbackModal,
}) => {
  const [goalFilter, setGoalFilter] = useState<'All' | 'On Track' | 'At Risk' | 'Completed'>('All');

  // Filter for employee goals (Aarav Sharma EMP-1001)
  const employeeGoals = goals.filter((g) => g.employeeId === 'EMP-1001' || g.ownerId === 'emp_01');
  const employeeKpis = kpis.filter((k) => k.employeeId === 'EMP-1001' || k.department === 'Engineering');
  const employeeReview = reviews.find((r) => r.employeeId === 'EMP-1001' || r.employeeId === 'emp_01') || reviews[0];
  const employeeFeedbacks = feedbacks.filter((f) => f.toEmployeeId === 'EMP-1001' || f.toUserId === 'emp_01');
  const employeeDevPlans = developmentPlans.filter((d) => d.employeeId === 'EMP-1001' || d.employeeId === 'emp_01');

  const scoreSummary = computeEmployeePerformanceScore(employeeGoals, employeeKpis);

  const filteredGoals = employeeGoals.filter((g) => {
    if (goalFilter === 'All') return true;
    return g.status === goalFilter;
  });

  return (
    <div className="space-y-4 pb-8">
      {/* Primary Employee Subtabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onSelectSubTab('home')}
          className={`flex-1 min-w-[65px] py-1.5 px-2 rounded-lg text-center transition-all ${
            activeSubTab === 'home' ? 'bg-white text-indigo-600 font-bold shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => onSelectSubTab('goals')}
          className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-lg text-center transition-all ${
            activeSubTab === 'goals' ? 'bg-white text-indigo-600 font-bold shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          My Goals ({employeeGoals.length})
        </button>
        <button
          onClick={() => onSelectSubTab('performance')}
          className={`flex-1 min-w-[65px] py-1.5 px-2 rounded-lg text-center transition-all ${
            activeSubTab === 'performance' ? 'bg-white text-indigo-600 font-bold shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Review
        </button>
        <button
          onClick={() => onSelectSubTab('feedback')}
          className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-lg text-center transition-all ${
            activeSubTab === 'feedback' ? 'bg-white text-indigo-600 font-bold shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Feedback ({employeeFeedbacks.length})
        </button>
      </div>

      {/* TAB 1: HOME */}
      {activeSubTab === 'home' && (
        <div className="space-y-4">
          {/* Top Hero Performance Card */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden border border-indigo-900/60">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-violet-600/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300">
                  Q4 Performance Cycle
                </span>
                <h2 className="text-xl font-bold mt-0.5">Aarav Sharma</h2>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  Principal Engineer · Fintech Core
                </p>
              </div>
              <button
                onClick={onCreateGoal}
                className="flex items-center gap-1.5 px-3 py-2 bg-white text-indigo-900 rounded-xl font-bold text-xs shadow hover:bg-indigo-50 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                New Goal
              </button>
            </div>

            {/* Performance Score Display */}
            <div className="mt-4 pt-4 border-t border-indigo-800/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-300">Blended Performance Score</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {scoreSummary.overallScore.toFixed(1)}
                  </span>
                  <span className="text-xs text-indigo-200">/ 5.0</span>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    ★ {scoreSummary.grade.split(' ')[0]}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-indigo-300">Goals Velocity</span>
                <p className="text-base font-bold text-white mt-0.5">
                  {scoreSummary.onTrackRatio}% On Track
                </p>
              </div>
            </div>

            {/* Mini Stat Badges */}
            <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-indigo-900/60 text-center text-xs">
              <div className="bg-white/5 rounded-2xl p-2.5 backdrop-blur-xs">
                <p className="text-lg font-bold text-white">{employeeGoals.length}</p>
                <p className="text-[10px] text-indigo-200">Active Goals</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-2.5 backdrop-blur-xs">
                <p className="text-lg font-bold text-white">
                  {employeeGoals.filter((g) => g.status === 'Completed').length}
                </p>
                <p className="text-[10px] text-indigo-200">Completed</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-2.5 backdrop-blur-xs">
                <p className="text-lg font-bold text-white">{employeeKpis.length}</p>
                <p className="text-[10px] text-indigo-200">KPIs Tracked</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-2.5 backdrop-blur-xs">
                <p className="text-lg font-bold text-white">{employeeFeedbacks.length}</p>
                <p className="text-[10px] text-indigo-200">360 Praises</p>
              </div>
            </div>
          </div>

          {/* Review Alert Banner */}
          {employeeReview && (
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-3xl p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-violet-600 uppercase">Q4 Appraisal Due</span>
                  <h4 className="text-xs font-bold text-slate-900">{employeeReview.cycleTitle || 'Annual Review Self Assessment'}</h4>
                  <p className="text-[11px] text-slate-500">Stage: {employeeReview.stage || 'Manager Evaluation'}</p>
                </div>
              </div>
              <button
                onClick={() => onOpenSelfAssessment(employeeReview)}
                className="px-3 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-violet-700"
              >
                Start Review
              </button>
            </div>
          )}

          {/* Quick Goals Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Top Priority Goals ({employeeGoals.length})
              </h3>
              <button
                onClick={() => onSelectSubTab('goals')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {employeeGoals.slice(0, 2).map((goal) => (
                <div
                  key={goal.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">{goal.id}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                          {goal.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">{goal.title}</h4>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        goal.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : goal.status === 'On Track'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {goal.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 text-[11px]">Progress</span>
                      <span className="font-bold text-slate-800">
                        {goal.progressPercentage ?? goal.progress ?? 0}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${goal.progressPercentage ?? goal.progress ?? 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">Due {goal.dueDate}</span>
                    <button
                      onClick={() => onUpdateGoalProgress(goal)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      Update Progress →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Praise Card */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800">
                <Award className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-xs">Recent 360° Praise Received</span>
              </div>
              <button
                onClick={onOpenFeedbackModal}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800"
              >
                + Praise Colleague
              </button>
            </div>
            {employeeFeedbacks[0] && (
              <p className="text-xs text-amber-950 italic line-clamp-2">
                &quot;{employeeFeedbacks[0].message || employeeFeedbacks[0].comments || 'High quality contribution'}&quot;
              </p>
            )}
            <p className="text-[10px] text-amber-700 font-medium">
              From {employeeFeedbacks[0]?.fromName || employeeFeedbacks[0]?.fromUserName || 'Team Lead'} · {employeeFeedbacks[0]?.date || 'This month'}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: MY GOALS */}
      {activeSubTab === 'goals' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">My Goals & OKRs</h2>
              <p className="text-xs text-slate-500">Align initiatives & track milestone delivery</p>
            </div>
            <button
              onClick={onCreateGoal}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-indigo-700"
            >
              <Plus className="w-3.5 h-3.5" /> New Goal
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {(['All', 'On Track', 'At Risk', 'Completed'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setGoalFilter(filter)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  goalFilter === filter
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Goals List */}
          <div className="space-y-3">
            {filteredGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">{goal.id}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                        {goal.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Weight: {goal.weightage}%</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 mt-1">{goal.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{goal.description}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      goal.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : goal.status === 'On Track'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {goal.status}
                  </span>
                </div>

                {/* Overall Progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 text-[11px]">Milestone Delivery</span>
                    <span className="font-bold text-slate-900">
                      {goal.progressPercentage ?? goal.progress ?? 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${goal.progressPercentage ?? goal.progress ?? 0}%` }}
                    />
                  </div>
                </div>

                {/* Key Results */}
                {goal.keyResults && goal.keyResults.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                      <span>Key Results ({goal.keyResults.length})</span>
                      <span className="text-[10px] text-slate-400">Target vs Actual</span>
                    </div>
                    <div className="space-y-1.5">
                      {goal.keyResults.map((kr) => (
                        <div key={kr.id} className="text-xs space-y-0.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-700 font-medium truncate max-w-[220px]">
                              • {kr.title}
                            </span>
                            <span className="text-slate-900 font-bold">
                              {kr.current ?? kr.currentValue}/{kr.target ?? kr.targetValue} {kr.unit}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-500 h-full rounded-full"
                              style={{ width: `${kr.progressPct ?? 0}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 text-[11px]">Due: {goal.dueDate}</span>
                  <button
                    onClick={() => onUpdateGoalProgress(goal)}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-semibold text-xs"
                  >
                    Update Progress
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PERFORMANCE & KPIS */}
      {activeSubTab === 'performance' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Performance & KPIs</h2>
            <p className="text-xs text-slate-500">Measurable scorecards, SLAs and appraisals</p>
          </div>

          {/* Evaluation Summary Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Review Status</span>
                <h3 className="text-sm font-bold text-slate-900">{employeeReview?.cycleTitle || 'Annual Cycle'}</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                {employeeReview?.stage || 'Self Assessment'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-600">Self Evaluation Score:</span>
                <span className="font-bold text-indigo-600">
                  {employeeReview?.selfScore ? `${employeeReview.selfScore.toFixed(1)} / 5.0` : 'Not submitted'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Manager Evaluation:</span>
                <span className="font-bold text-slate-900">
                  {employeeReview?.managerScore ? `${employeeReview.managerScore.toFixed(1)} / 5.0` : 'Pending'}
                </span>
              </div>
              {employeeReview?.finalRating && (
                <div className="flex justify-between border-t border-slate-200 pt-1">
                  <span className="text-slate-900 font-bold">Final Calibrated Rating:</span>
                  <span className="font-bold text-emerald-600">{employeeReview.finalRating.toFixed(1)} / 5.0</span>
                </div>
              )}
            </div>

            {employeeReview && (
              <button
                onClick={() => onOpenSelfAssessment(employeeReview)}
                className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow"
              >
                {employeeReview.selfScore ? 'Edit Self Assessment' : 'Submit Self Assessment'}
              </button>
            )}
          </div>

          {/* KPI Library Roster */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900">Active Key Performance Indicators ({employeeKpis.length})</h3>
            {employeeKpis.map((kpi) => (
              <div
                key={kpi.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">{kpi.code}</span>
                    <h4 className="text-xs font-bold text-slate-900">{kpi.title || kpi.name}</h4>
                    <p className="text-[11px] text-slate-500">{kpi.category}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    ★ {(kpi.score ?? 4.5).toFixed(1)} / 5
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-2.5 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Target</span>
                    <p className="font-bold text-slate-900">
                      {kpi.target} {kpi.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Actual</span>
                    <p className="font-bold text-indigo-600">
                      {kpi.actual} {kpi.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Weightage</span>
                    <p className="font-bold text-slate-900">{kpi.weightage}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FEEDBACK & 360 */}
      {activeSubTab === 'feedback' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">360° Feedback & Praises</h2>
              <p className="text-xs text-slate-500">Peer reviews, manager guidance & recognition</p>
            </div>
            <button
              onClick={onOpenFeedbackModal}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-indigo-700"
            >
              <Plus className="w-3.5 h-3.5" /> Praise
            </button>
          </div>

          <div className="space-y-2.5">
            {employeeFeedbacks.map((fb) => {
              const fromName = fb.fromName || fb.fromUserName || (fb.isAnonymous ? 'Anonymous' : 'Colleague');
              const message = fb.message || fb.comments || 'Great collaboration!';
              const feedbackType = fb.type || fb.relationship || 'Peer';
              const rating = typeof fb.rating === 'number' ? fb.rating : 5;
              return (
                <div
                  key={fb.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs">
                        {fromName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{fromName}</h4>
                        <span className="text-[10px] text-slate-400">{feedbackType} Feedback · {fb.date}</span>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {rating.toFixed(1)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    &quot;{message}&quot;
                  </p>

                  {fb.competencies && (
                    <div className="grid grid-cols-4 gap-1 text-[10px] text-center text-slate-500 pt-1">
                      <span className="bg-slate-100 py-1 rounded">Teamwork: {fb.competencies.teamwork ?? 5}</span>
                      <span className="bg-slate-100 py-1 rounded">Delivery: {fb.competencies.delivery ?? 5}</span>
                      <span className="bg-slate-100 py-1 rounded">Innov: {fb.competencies.innovation ?? 5}</span>
                      <span className="bg-slate-100 py-1 rounded">Collab: {fb.competencies.collaboration ?? 5}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: PROFILE & DEVELOPMENT */}
      {activeSubTab === 'profile' && (
        <div className="space-y-4">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              AS
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Aarav Sharma</h2>
              <p className="text-xs text-slate-500">Principal Engineer · Fintech Core · EMP-1001</p>
              <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Reporting Manager: Vikramaditya Nair
              </span>
            </div>
          </div>

          {/* Development Plans Section */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900">Development & Upskilling Plans</h3>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {employeeDevPlans.length} Active Tracks
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {employeeDevPlans.map((dev) => (
                <div key={dev.id} className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{dev.skillTitle || dev.skill}</span>
                    <span className="font-bold text-indigo-600">{dev.progressPct ?? dev.progress ?? 80}%</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Recommended: <strong className="text-slate-800">{dev.recommendedTraining}</strong>
                  </p>
                  <div className="space-y-1">
                    {dev.milestones?.map((m, mIdx) => (
                      <div key={mIdx} className="flex items-center gap-2 text-[11px]">
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center ${m.completed ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>
                          {m.completed && '✓'}
                        </span>
                        <span className={m.completed ? 'line-through text-slate-400' : 'text-slate-700'}>
                          {m.title || m.name || `Milestone ${mIdx + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
