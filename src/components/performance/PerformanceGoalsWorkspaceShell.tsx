'use client';

import React, { useState } from 'react';
import {
  Target,
  ArrowLeft,
  Bell,
  Sparkles,
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
import {
  SEED_GOALS,
  SEED_KPIS,
  SEED_REVIEW_CYCLES,
  SEED_PERFORMANCE_REVIEWS,
  SEED_360_FEEDBACKS,
  SEED_PIPS,
  SEED_DEVELOPMENT_PLANS,
  SEED_ACTIVITY_LOGS,
} from '../../services/performance/performanceEngine';
import {
  CreateGoalModal,
  UpdateGoalProgressModal,
  SelfAssessmentModal,
  ManagerEvaluationModal,
  Submit360FeedbackModal,
} from './PerformanceModals';
import { EmployeePerformanceView } from './EmployeePerformanceView';
import { ManagerPerformanceView } from './ManagerPerformanceView';
import { HrAdminPerformanceView } from './HrAdminPerformanceView';
import { ExecutivePerformanceView } from './ExecutivePerformanceView';
import { ItAdminPerformanceView } from './ItAdminPerformanceView';

export type PerformanceRole = 'Employee' | 'Manager' | 'HR Admin' | 'Executive' | 'IT Admin';

interface PerformanceGoalsWorkspaceShellProps {
  embedded?: boolean;
  onBackFromEmbedded?: () => void;
}

const STORAGE_KEY_PREFIX = 'ofc360_performance_v1_';

export function PerformanceGoalsWorkspaceShell({
  embedded = false,
  onBackFromEmbedded,
}: PerformanceGoalsWorkspaceShellProps) {
  // Current Active Role
  const [activeRole, setActiveRole] = useState<PerformanceRole>('Employee');

  // Core Datasets with LocalStorage persistence via lazy initializers
  const [goals, setGoals] = useState<GoalRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}goals`);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return SEED_GOALS;
  });
  const [kpis, setKpis] = useState<KpiRecord[]>(SEED_KPIS);
  const [reviewCycles, setReviewCycles] = useState<ReviewCycleRecord[]>(SEED_REVIEW_CYCLES);
  const [reviews, setReviews] = useState<PerformanceReviewRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}reviews`);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return SEED_PERFORMANCE_REVIEWS;
  });
  const [feedbacks, setFeedbacks] = useState<Feedback360Record[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}feedbacks`);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return SEED_360_FEEDBACKS;
  });
  const [pips, setPips] = useState<PipRecord[]>(SEED_PIPS);
  const [devPlans, setDevPlans] = useState<DevelopmentPlanRecord[]>(SEED_DEVELOPMENT_PLANS);
  const [activityLogs, setActivityLogs] = useState<PerformanceActivityLog[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}logs`);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return SEED_ACTIVITY_LOGS;
  });

  // Active Bottom Nav Subtab per Role
  const [employeeSubNav, setEmployeeSubNav] = useState<'home' | 'goals' | 'performance' | 'feedback' | 'profile'>('home');
  const [managerSubNav, setManagerSubNav] = useState<'dashboard' | 'goals' | 'reviews' | 'feedback' | 'profile'>('dashboard');

  // Modals state
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);
  const [selectedGoalForProgress, setSelectedGoalForProgress] = useState<GoalRecord | null>(null);
  const [selectedReviewForSelf, setSelectedReviewForSelf] = useState<PerformanceReviewRecord | null>(null);
  const [selectedReviewForManager, setSelectedReviewForManager] = useState<PerformanceReviewRecord | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  const logActivity = (action: string, details: string) => {
    const newLog: PerformanceActivityLog = {
      id: `log_${Date.now()}`,
      action,
      details,
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      userId: 'usr_curr',
      userName: activeRole === 'Employee' ? 'Aarav Sharma' : activeRole === 'Manager' ? 'Dev Verma' : 'Pooja Iyer',
      userRole: activeRole,
    };
    const updated = [newLog, ...activityLogs];
    setActivityLogs(updated);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}logs`, JSON.stringify(updated));
    } catch {}
  };

  // Handlers
  const handleCreateGoal = (newGoalData: Partial<GoalRecord>) => {
    const goal: GoalRecord = {
      id: `goal_${Date.now()}`,
      title: newGoalData.title || 'Untitled Goal',
      description: newGoalData.description || '',
      category: newGoalData.category || 'Individual',
      ownerId: 'emp_01',
      ownerName: activeRole === 'Employee' ? 'Aarav Sharma' : 'Dev Verma',
      department: 'Engineering',
      status: 'On Track',
      progress: 0,
      weightage: newGoalData.weightage || 20,
      startDate: newGoalData.startDate || new Date().toISOString().split('T')[0],
      dueDate: newGoalData.dueDate || '2025-03-31',
      keyResults: newGoalData.keyResults || [],
      alignedOrgGoalId: newGoalData.alignedOrgGoalId,
      commentsCount: 0,
    };
    const updated = [goal, ...goals];
    setGoals(updated);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}goals`, JSON.stringify(updated));
    } catch {}
    logActivity('Create Goal', `Created new goal: "${goal.title}"`);
    showToast('Goal created successfully.');
  };

  const handleUpdateGoalProgress = (goalId: string, progress: number, keyResults?: GoalRecord['keyResults']) => {
    const updated = goals.map((g) => {
      if (g.id === goalId) {
        return {
          ...g,
          progress,
          keyResults: keyResults || g.keyResults,
          status: progress >= 100 ? ('Completed' as const) : progress < 40 ? ('At Risk' as const) : ('On Track' as const),
        };
      }
      return g;
    });
    setGoals(updated);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}goals`, JSON.stringify(updated));
    } catch {}
    logActivity('Update Goal Progress', `Updated goal progress to ${progress}%`);
    showToast(`Goal progress updated to ${progress}%.`);
  };

  const handleSubmitSelfAssessment = (reviewId: string, selfScore: number, narrative: string) => {
    const updated = reviews.map((r) => {
      if (r.id === reviewId) {
        return {
          ...r,
          selfScore,
          selfNarrative: narrative,
          status: 'Manager Review' as const,
        };
      }
      return r;
    });
    setReviews(updated);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}reviews`, JSON.stringify(updated));
    } catch {}
    logActivity('Submit Self Assessment', `Self assessment submitted with score ${selfScore}/5.0`);
    showToast('Self assessment submitted to manager.');
  };

  const handleSubmitManagerEvaluation = (reviewId: string, mgrScore: number, feedback: string, promote: boolean) => {
    const updated = reviews.map((r) => {
      if (r.id === reviewId) {
        return {
          ...r,
          managerScore: mgrScore,
          managerFeedback: feedback,
          promotionRecommended: promote,
          status: 'HR Calibration' as const,
        };
      }
      return r;
    });
    setReviews(updated);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}reviews`, JSON.stringify(updated));
    } catch {}
    logActivity('Submit Manager Evaluation', `Manager evaluation submitted (Score ${mgrScore}/5.0)`);
    showToast('Manager evaluation saved and forwarded to HR.');
  };

  const handleSubmit360Feedback = (feedbackData: Partial<Feedback360Record>) => {
    const item: Feedback360Record = {
      id: `fb_${Date.now()}`,
      fromUserId: 'emp_01',
      fromUserName: 'Aarav Sharma',
      fromRole: 'Senior Frontend Engineer',
      toUserId: feedbackData.toUserId || 'emp_02',
      toUserName: feedbackData.toUserName || 'Rhea Sen',
      relationship: feedbackData.relationship || 'Peer',
      rating: feedbackData.rating || 5,
      comments: feedbackData.comments || '',
      strengths: feedbackData.strengths || ['Collaborative'],
      improvementAreas: feedbackData.improvementAreas || [],
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      isAnonymous: feedbackData.isAnonymous || false,
    };
    const updated = [item, ...feedbacks];
    setFeedbacks(updated);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}feedbacks`, JSON.stringify(updated));
    } catch {}
    logActivity('Submit 360 Feedback', `Submitted feedback for ${item.toUserName}`);
    showToast(`360 feedback sent to ${item.toUserName}.`);
  };

  const handleResetMockData = () => {
    setGoals(SEED_GOALS);
    setKpis(SEED_KPIS);
    setReviewCycles(SEED_REVIEW_CYCLES);
    setReviews(SEED_PERFORMANCE_REVIEWS);
    setFeedbacks(SEED_360_FEEDBACKS);
    setPips(SEED_PIPS);
    setDevPlans(SEED_DEVELOPMENT_PLANS);
    setActivityLogs(SEED_ACTIVITY_LOGS);
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}goals`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}reviews`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}feedbacks`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}logs`);
    } catch {}
    showToast('Mock data reset to initial seed values.');
  };

  return (
    <div className="relative min-h-[580px] bg-slate-50 font-sans text-slate-900 pb-6">
      {/* Toast Notification Pill */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Module Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!embedded && onBackFromEmbedded && (
              <button
                onClick={onBackFromEmbedded}
                className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                title="Back to All Modules"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-xs">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 leading-tight">Performance & Goals</h1>
                <p className="text-[11px] text-slate-500">OFC360 Talent & OKR Suite</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => showToast('All goals and appraisals are synchronized.')}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4">
        {activeRole === 'Employee' && (
          <EmployeePerformanceView
            goals={goals}
            kpis={kpis}
            reviews={reviews}
            feedbacks={feedbacks}
            developmentPlans={devPlans}
            activeSubTab={employeeSubNav}
            onSelectSubTab={(tab) => setEmployeeSubNav(tab as any)}
            onCreateGoal={() => setShowCreateGoalModal(true)}
            onUpdateGoalProgress={(g) => setSelectedGoalForProgress(g)}
            onOpenSelfAssessment={(rev) => setSelectedReviewForSelf(rev)}
            onOpenFeedbackModal={() => setShowFeedbackModal(true)}
          />
        )}

        {activeRole === 'Manager' && (
          <ManagerPerformanceView
            goals={goals}
            reviews={reviews}
            feedbacks={feedbacks}
            pips={pips}
            activeSubTab={managerSubNav}
            onSelectSubTab={(tab) => setManagerSubNav(tab as any)}
            onOpenManagerReview={(rev) => setSelectedReviewForManager(rev)}
            onAssignNewGoal={() => setShowCreateGoalModal(true)}
            onUpdateGoalProgress={(g) => setSelectedGoalForProgress(g)}
            onOpenFeedbackModal={() => setShowFeedbackModal(true)}
          />
        )}

        {activeRole === 'HR Admin' && (
          <HrAdminPerformanceView
            goals={goals}
            kpis={kpis}
            reviewCycles={reviewCycles}
            reviews={reviews}
            feedbacks={feedbacks}
            pips={pips}
            devPlans={devPlans}
            activityLogs={activityLogs}
            onOpenCreateGoal={() => setShowCreateGoalModal(true)}
            onToast={showToast}
          />
        )}

        {activeRole === 'Executive' && (
          <ExecutivePerformanceView
            goals={goals}
            reviewCycles={reviewCycles}
            reviews={reviews}
            pips={pips}
            onToast={showToast}
          />
        )}

        {activeRole === 'IT Admin' && (
          <ItAdminPerformanceView
            activityLogs={activityLogs}
            onResetMockData={handleResetMockData}
            onToast={showToast}
          />
        )}
      </div>

      {/* Modals */}
      <CreateGoalModal
        isOpen={showCreateGoalModal}
        onClose={() => setShowCreateGoalModal(false)}
        onSubmit={handleCreateGoal}
      />

      <UpdateGoalProgressModal
        isOpen={!!selectedGoalForProgress}
        goal={selectedGoalForProgress}
        onClose={() => setSelectedGoalForProgress(null)}
        onSaveProgress={(goalId, newProgress, newStatus, updatedKrs) =>
          handleUpdateGoalProgress(goalId, newProgress, updatedKrs)
        }
      />

      <SelfAssessmentModal
        isOpen={!!selectedReviewForSelf}
        review={selectedReviewForSelf}
        onClose={() => setSelectedReviewForSelf(null)}
        onSubmitSelfAssessment={(reviewId, selfScore, comments) =>
          handleSubmitSelfAssessment(reviewId, selfScore, comments)
        }
      />

      <ManagerEvaluationModal
        isOpen={!!selectedReviewForManager}
        review={selectedReviewForManager}
        onClose={() => setSelectedReviewForManager(null)}
        onSubmitManagerReview={(reviewId, mgrScore, feedback, promote) =>
          handleSubmitManagerEvaluation(reviewId, mgrScore, feedback, promote)
        }
      />

      <Submit360FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmitFeedback={handleSubmit360Feedback}
      />
    </div>
  );
}
