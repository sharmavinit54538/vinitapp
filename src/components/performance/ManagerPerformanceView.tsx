'use client';

import React, { useState } from 'react';
import {
  Users,
  Award,
  TrendingUp,
  Target,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ChevronRight,
  ShieldAlert,
  Star,
  FileCheck2,
  Calendar,
} from 'lucide-react';
import {
  Feedback360Record,
  GoalRecord,
  PerformanceReviewRecord,
  PipRecord,
} from '../../types/performanceGoals';

interface ManagerPerformanceViewProps {
  goals: GoalRecord[];
  reviews: PerformanceReviewRecord[];
  feedbacks: Feedback360Record[];
  pips: PipRecord[];
  activeSubTab: string;
  onSelectSubTab: (tab: string) => void;
  onOpenManagerReview: (review: PerformanceReviewRecord) => void;
  onAssignNewGoal: () => void;
  onUpdateGoalProgress: (goal: GoalRecord) => void;
  onOpenFeedbackModal: () => void;
}

export const ManagerPerformanceView: React.FC<ManagerPerformanceViewProps> = ({
  goals,
  reviews,
  feedbacks,
  pips,
  activeSubTab,
  onSelectSubTab,
  onOpenManagerReview,
  onAssignNewGoal,
  onUpdateGoalProgress,
  onOpenFeedbackModal,
}) => {
  const [selectedReport, setSelectedReport] = useState<string>('All');

  // Filter for direct reports of Vikramaditya Nair
  const teamGoals = goals.filter((g) => g.assignedManager === 'Vikramaditya Nair');
  const teamReviews = reviews.filter((r) => r.managerName === 'Vikramaditya Nair');
  const pendingManagerReviews = teamReviews.filter((r) => r.stage === 'Manager Evaluation' || r.status === 'Manager Review');

  const filteredGoals = teamGoals.filter((g) => {
    if (selectedReport === 'All') return true;
    return (g.employeeName || g.ownerName) === selectedReport;
  });

  return (
    <div className="space-y-4 pb-8">
      {/* Primary Manager Subtabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onSelectSubTab('dashboard')}
          className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-lg text-center transition-all ${
            activeSubTab === 'dashboard' ? 'bg-white text-indigo-600 font-bold shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectSubTab('team_goals')}
          className={`flex-1 min-w-[85px] py-1.5 px-2 rounded-lg text-center transition-all ${
            activeSubTab === 'team_goals' || activeSubTab === 'goals' ? 'bg-white text-indigo-600 font-bold shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Team Goals ({teamGoals.length})
        </button>
        <button
          onClick={() => onSelectSubTab('reviews')}
          className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-lg text-center transition-all ${
            activeSubTab === 'reviews' ? 'bg-white text-indigo-600 font-bold shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Reviews ({teamReviews.length})
        </button>
        <button
          onClick={() => onSelectSubTab('feedback')}
          className={`flex-1 min-w-[85px] py-1.5 px-2 rounded-lg text-center transition-all ${
            activeSubTab === 'feedback' ? 'bg-white text-indigo-600 font-bold shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Feedback & PIP
        </button>
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-4">
          {/* Manager Team Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-5 shadow-xl border border-indigo-900/40 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
                  Team Performance Lead · Manager Desk
                </span>
                <h2 className="text-xl font-bold mt-0.5">Vikramaditya Nair</h2>
                <p className="text-xs text-slate-300 mt-1">
                  Product & Engineering Unit · 6 Direct Reports
                </p>
              </div>
              {pendingManagerReviews.length > 0 && (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold animate-pulse">
                  {pendingManagerReviews.length} To Review
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800 text-center text-xs">
              <div>
                <p className="text-xl font-bold text-white">4.7</p>
                <p className="text-[10px] text-slate-400">Team Avg Rating</p>
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-400">86%</p>
                <p className="text-[10px] text-slate-400">Goals Velocity</p>
              </div>
              <div>
                <p className="text-xl font-bold text-amber-400">{pendingManagerReviews.length}</p>
                <p className="text-[10px] text-slate-400">Reviews Pending</p>
              </div>
            </div>
          </div>

          {/* Pending Reviews Queue */}
          {pendingManagerReviews.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">
                  Awaiting Manager Evaluation ({pendingManagerReviews.length})
                </h3>
                <button
                  onClick={() => onSelectSubTab('reviews')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Review Queue
                </button>
              </div>

              {pendingManagerReviews.slice(0, 1).map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white p-4 rounded-2xl border border-indigo-200/80 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">{rev.id}</span>
                        <h4 className="text-sm font-bold text-slate-900">{rev.employeeName}</h4>
                      </div>
                      <p className="text-xs text-slate-500">{rev.designation}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      Self Assessment: {rev.selfScore?.toFixed(1) || '4.5'}
                    </span>
                  </div>

                  {rev.selfComments && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      &quot;{rev.selfComments}&quot;
                    </p>
                  )}

                  <button
                    onClick={() => onOpenManagerReview(rev)}
                    className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow flex items-center justify-center gap-1.5"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" /> Evaluate & Rate Employee
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Team Performance Overview List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Direct Reports Performance Roster</h3>
              <button
                onClick={() => onSelectSubTab('team_goals')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                All Goals
              </button>
            </div>

            <div className="space-y-2">
              {teamReviews.map((rev) => (
                <div
                  key={rev.id}
                  onClick={() => onOpenManagerReview(rev)}
                  className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {rev.employeeName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{rev.employeeName}</p>
                      <p className="text-[11px] text-slate-500">{rev.department}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-indigo-600">
                      {rev.finalRating ? `${rev.finalRating.toFixed(1)} / 5` : rev.stage}
                    </span>
                    <p className="text-[10px] text-slate-400">{rev.stage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEAM GOALS */}
      {(activeSubTab === 'team_goals' || activeSubTab === 'goals') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Team Goals & OKRs</h2>
              <p className="text-xs text-slate-500">Assign deliverables and review key results</p>
            </div>
            <button
              onClick={onAssignNewGoal}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-indigo-700"
            >
              <Plus className="w-3.5 h-3.5" /> Assign Goal
            </button>
          </div>

          {/* Member Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {['All', 'Aarav Sharma', 'Elena Rostova', 'Marcus Vance', 'Sora Takahashi'].map((name) => (
              <button
                key={name}
                onClick={() => setSelectedReport(name)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedReport === name
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredGoals.map((g) => (
              <div
                key={g.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">{g.id}</span>
                    <h3 className="text-xs font-bold text-slate-900">{g.title}</h3>
                    <p className="text-[11px] text-indigo-600 font-medium">Assigned to: {g.employeeName || g.ownerName}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      g.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : g.status === 'On Track'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {g.status}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1 text-slate-500">
                    <span>Progress</span>
                    <span className="font-bold text-slate-900">{g.progressPercentage ?? g.progress ?? 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${g.progressPercentage ?? g.progress ?? 0}%` }}
                    />
                  </div>
                </div>

                {g.keyResults && g.keyResults.length > 0 && (
                  <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-bold text-[10px] uppercase text-slate-400">Key Results</span>
                    {g.keyResults.map((kr) => (
                      <div key={kr.id} className="flex justify-between text-[11px] text-slate-700">
                        <span className="truncate max-w-[200px]">• {kr.title}</span>
                        <span className="font-bold">
                          {kr.current ?? kr.currentValue}/{kr.target ?? kr.targetValue} {kr.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-400">Due: {g.dueDate}</span>
                  <button
                    onClick={() => onUpdateGoalProgress(g)}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Manage Progress →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REVIEWS */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Manager Reviews Queue</h2>
            <p className="text-xs text-slate-500">Evaluate, rate, and calibrate team appraisals</p>
          </div>

          <div className="space-y-3">
            {teamReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">{rev.id}</span>
                    <h3 className="text-sm font-bold text-slate-900">{rev.employeeName}</h3>
                    <p className="text-xs text-slate-500">{rev.designation}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      rev.stage === 'Finalized'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rev.stage === 'Manager Evaluation'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {rev.stage}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <p>
                    <strong>Self Rating:</strong> {rev.selfScore ? `${rev.selfScore.toFixed(1)} / 5.0` : 'Not submitted yet'}
                  </p>
                  {rev.managerScore && (
                    <p>
                      <strong>Manager Score:</strong> {rev.managerScore.toFixed(1)} / 5.0
                    </p>
                  )}
                  {Boolean(rev.strengths && rev.strengths.length > 0) && (
                    <p className="text-slate-600">
                      <strong>Strengths:</strong> {rev.strengths?.join(', ')}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onOpenManagerReview(rev)}
                  className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
                >
                  {rev.stage === 'Manager Evaluation' ? 'Review & Submit Rating' : 'View Full Evaluation'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FEEDBACK & PIP */}
      {activeSubTab === 'feedback' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">360° Feedback & PIP Mentorship</h2>
            <p className="text-xs text-slate-500">Peer ratings and performance improvement plans</p>
          </div>

          {/* PIP Section */}
          {pips.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-800">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold">Active Performance Improvement Plan (PIP)</h3>
              </div>
              {pips.map((p) => (
                <div key={p.id} className="bg-white p-3 rounded-xl border border-rose-100 text-xs space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{p.employeeName} ({p.department})</span>
                    <span className="text-rose-600">{p.progressPct ?? 65}% Progress</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">&quot;{p.managerComments || p.reason}&quot;</p>
                </div>
              ))}
            </div>
          )}

          {/* Feedback List */}
          <div className="space-y-2">
            {feedbacks.map((f) => (
              <div key={f.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">
                    {f.fromName || f.fromUserName || 'Colleague'} → {f.toEmployeeName || f.toUserName || 'Team Member'}
                  </span>
                  <span className="text-amber-600 font-bold">★ {(f.rating ?? 5).toFixed(1)}</span>
                </div>
                <p className="text-slate-600 italic">&quot;{f.message || f.comments || 'Great work!'}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PROFILE */}
      {activeSubTab === 'profile' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white flex items-center justify-center font-bold text-lg">
              VN
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Vikramaditya Nair</h2>
              <p className="text-xs text-slate-500">Lead Product Designer & Mgr · Engineering</p>
              <span className="inline-block mt-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                Management Span: 6 Direct Reports
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
