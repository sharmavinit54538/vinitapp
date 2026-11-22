'use client';

import React, { useState } from 'react';
import {
  X,
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Award,
  MessageSquare,
  UserCheck,
  TrendingUp,
  FileText,
  Star,
  Shield,
} from 'lucide-react';
import {
  Feedback360Record,
  GoalCategory,
  GoalPriority,
  GoalRecord,
  GoalStatus,
  KeyResultItem,
  PerformanceReviewRecord,
  PipRecord,
} from '../../types/performanceGoals';
import { calculateGoalOverallProgress } from '../../services/performance/performanceEngine';

// MODAL 1: Create Goal Modal
interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: Partial<GoalRecord>) => void;
  defaultEmployee?: { id: string; name: string; department: string; manager: string };
}

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultEmployee = {
    id: 'EMP-1001',
    name: 'Aarav Sharma',
    department: 'Engineering',
    manager: 'Vikramaditya Nair',
  },
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Individual');
  const [priority, setPriority] = useState<GoalPriority>('High');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [dueDate, setDueDate] = useState('2026-12-31');
  const [weightage, setWeightage] = useState<number>(25);
  const [unit, setUnit] = useState('%');
  const [targetValue, setTargetValue] = useState<number>(100);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [keyResults, setKeyResults] = useState<KeyResultItem[]>([
    { id: 'KR-1', title: 'Complete architectural sprint deliverables', target: 100, current: 0, unit: '%', progressPct: 0 },
  ]);
  const [newKrTitle, setNewKrTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddKeyResult = () => {
    if (!newKrTitle.trim()) return;
    const newKr: KeyResultItem = {
      id: `KR-${Date.now().toString().slice(-4)}`,
      title: newKrTitle.trim(),
      target: 100,
      current: 0,
      unit: '%',
      progressPct: 0,
    };
    setKeyResults([...keyResults, newKr]);
    setNewKrTitle('');
  };

  const handleRemoveKeyResult = (id: string) => {
    setKeyResults(keyResults.filter((kr) => kr.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Goal title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }
    setError(null);

    const calculatedProgress = calculateGoalOverallProgress(keyResults);

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      startDate,
      dueDate,
      weightage,
      unit,
      targetValue,
      currentValue,
      employeeId: defaultEmployee.id,
      employeeName: defaultEmployee.name,
      department: defaultEmployee.department,
      assignedManager: defaultEmployee.manager,
      keyResults,
      progressPercentage: calculatedProgress,
      status: 'On Track',
      feedbackCount: 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Create Performance Goal / OKR</h3>
              <p className="text-[11px] text-slate-500">Align deliverables with Q4 department targets</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Goal Title *</label>
            <input
              type="text"
              placeholder="e.g. Optimize API Gateway p99 Latency"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Description & Expected Outcomes *</label>
            <textarea
              rows={2}
              placeholder="Detail the metrics, target impact, and success criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GoalCategory)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="Individual">Individual Goal</option>
                <option value="Team">Team Goal</option>
                <option value="Department">Department Goal</option>
                <option value="Organizational">Organizational Goal</option>
                <option value="Development">Development Goal</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as GoalPriority)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="Critical">Critical (P0)</option>
                <option value="High">High (P1)</option>
                <option value="Medium">Medium (P2)</option>
                <option value="Low">Low (P3)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Weightage (%)</label>
              <input
                type="number"
                min={5}
                max={100}
                value={weightage}
                onChange={(e) => setWeightage(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Metric Unit</label>
              <input
                type="text"
                placeholder="e.g. %, ms, units"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Key Results Section */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Key Results (KRs)</span>
              <span className="text-[10px] text-slate-500 font-mono">{keyResults.length} defined</span>
            </div>

            <div className="space-y-1.5">
              {keyResults.map((kr) => (
                <div
                  key={kr.id}
                  className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-slate-700 line-clamp-1 flex-1 mr-2">{kr.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {kr.progressPct}%
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyResult(kr.id)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add measurable milestone..."
                value={newKrTitle}
                onChange={(e) => setNewKrTitle(e.target.value)}
                className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleAddKeyResult}
                className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900"
              >
                + Add KR
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow hover:bg-indigo-700"
            >
              Save & Activate Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// MODAL 2: Update Goal Progress Modal
interface UpdateGoalProgressModalProps {
  isOpen: boolean;
  goal: GoalRecord | null;
  onClose: () => void;
  onSaveProgress: (goalId: string, newProgress: number, newStatus: GoalStatus, updatedKrs: KeyResultItem[]) => void;
}

export const UpdateGoalProgressModal: React.FC<UpdateGoalProgressModalProps> = ({
  isOpen,
  goal,
  onClose,
  onSaveProgress,
}) => {
  const [progress, setProgress] = useState<number>(goal?.progressPercentage || 50);
  const [status, setStatus] = useState<GoalStatus>(goal?.status || 'On Track');
  const [krs, setKrs] = useState<KeyResultItem[]>(goal?.keyResults || []);

  if (!isOpen || !goal) return null;

  const handleKrSlider = (krId: string, val: number) => {
    const updated = krs.map((item) => (item.id === krId ? { ...item, progressPct: val } : item));
    setKrs(updated);
    const avg = calculateGoalOverallProgress(updated);
    setProgress(avg);
    if (avg >= 100) setStatus('Completed');
    else if (avg < 40) setStatus('At Risk');
    else setStatus('On Track');
  };

  const handleSave = () => {
    onSaveProgress(goal.id, progress, status, krs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-mono font-medium text-slate-400">{goal.id}</span>
            <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{goal.title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Overall Progress</span>
            <span className="text-base font-bold text-indigo-600">{progress}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => {
              const val = Number(e.target.value);
              setProgress(val);
              if (val >= 100) setStatus('Completed');
            }}
            className="w-full accent-indigo-600 cursor-pointer"
          />

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as GoalStatus)}
              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
            >
              <option value="On Track">On Track (Healthy)</option>
              <option value="At Risk">At Risk (Needs Attention)</option>
              <option value="Delayed">Delayed (Blocked)</option>
              <option value="Completed">Completed (100% Target Met)</option>
            </select>
          </div>
        </div>

        {/* Key Results Slider Checklist */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Key Results Progress
          </h4>
          <div className="space-y-2">
            {krs.map((kr) => (
              <div key={kr.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 line-clamp-1">{kr.title}</span>
                  <span className="font-bold text-indigo-600">{kr.progressPct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={kr.progressPct}
                  onChange={(e) => handleKrSlider(kr.id, Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow hover:bg-indigo-700"
          >
            Save Progress
          </button>
        </div>
      </div>
    </div>
  );
};

// MODAL 3: Self Assessment Modal
interface SelfAssessmentModalProps {
  isOpen: boolean;
  review: PerformanceReviewRecord | null;
  onClose: () => void;
  onSubmitSelfAssessment: (reviewId: string, selfScore: number, comments: string, strengths: string[]) => void;
}

export const SelfAssessmentModal: React.FC<SelfAssessmentModalProps> = ({
  isOpen,
  review,
  onClose,
  onSubmitSelfAssessment,
}) => {
  const [selfScore, setSelfScore] = useState<number>(4.5);
  const [comments, setComments] = useState('');
  const [strengthInput, setStrengthInput] = useState('Rapid execution, System reliability, Cross-team mentorship');

  if (!isOpen || !review) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const strengths = strengthInput.split(',').map((s) => s.trim()).filter(Boolean);
    onSubmitSelfAssessment(review.id, selfScore, comments, strengths);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-mono text-slate-400">{review.cycleTitle}</span>
            <h3 className="text-sm font-bold text-slate-900">Submit Self Assessment</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Self Rating (1.0 to 5.0)</label>
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
              <input
                type="range"
                min={1.0}
                max={5.0}
                step={0.1}
                value={selfScore}
                onChange={(e) => setSelfScore(Number(e.target.value))}
                className="flex-1 accent-indigo-600"
              />
              <span className="text-lg font-bold text-indigo-600 w-12 text-center">{selfScore.toFixed(1)}</span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Key Strengths & Achievements</label>
            <input
              type="text"
              placeholder="Comma separated: Technical rigor, Mentoring..."
              value={strengthInput}
              onChange={(e) => setStrengthInput(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Self Assessment Summary & Narrative</label>
            <textarea
              rows={4}
              placeholder="Reflect on your quarterly highlights, obstacles navigated, and impact..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow hover:bg-indigo-700"
            >
              Submit to Manager
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// MODAL 4: Manager Evaluation Modal
interface ManagerEvaluationModalProps {
  isOpen: boolean;
  review: PerformanceReviewRecord | null;
  onClose: () => void;
  onSubmitManagerReview: (reviewId: string, managerScore: number, comments: string, promoteEndorsement: boolean) => void;
}

export const ManagerEvaluationModal: React.FC<ManagerEvaluationModalProps> = ({
  isOpen,
  review,
  onClose,
  onSubmitManagerReview,
}) => {
  const [managerScore, setManagerScore] = useState<number>(4.6);
  const [comments, setComments] = useState('');
  const [promoteEndorsement, setPromoteEndorsement] = useState(false);

  if (!isOpen || !review) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitManagerReview(review.id, managerScore, comments, promoteEndorsement);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-mono text-slate-400">{review.employeeId}</span>
            <h3 className="text-sm font-bold text-slate-900">Manager Evaluation: {review.employeeName}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Employee Self Score Summary */}
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-indigo-950">Employee Self Score:</span>
            <span className="font-bold text-indigo-700 text-sm">{review.selfScore?.toFixed(1) || 'Pending'} / 5.0</span>
          </div>
          {review.selfComments && (
            <p className="text-[11px] text-indigo-800 italic mt-1">&quot;{review.selfComments}&quot;</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Manager Rating (1.0 to 5.0)</label>
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
              <input
                type="range"
                min={1.0}
                max={5.0}
                step={0.1}
                value={managerScore}
                onChange={(e) => setManagerScore(Number(e.target.value))}
                className="flex-1 accent-indigo-600"
              />
              <span className="text-lg font-bold text-indigo-600 w-12 text-center">{managerScore.toFixed(1)}</span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Manager Appraisal Feedback & Guidance</label>
            <textarea
              rows={4}
              placeholder="Evaluate delivery, strengths, and targeted improvement areas for next quarter..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-amber-200 bg-amber-50 cursor-pointer">
            <input
              type="checkbox"
              checked={promoteEndorsement}
              onChange={(e) => setPromoteEndorsement(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span className="text-xs font-semibold text-amber-900">
              Endorse for Promotion / Exceptional Merit Tier in HR Calibration
            </span>
          </label>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow hover:bg-indigo-700"
            >
              Sign Off & Forward to HR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// MODAL 5: 360-Degree Peer Feedback Modal
interface Submit360FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitFeedback: (feedback: Omit<Feedback360Record, 'id' | 'date'>) => void;
}

export const Submit360FeedbackModal: React.FC<Submit360FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmitFeedback,
}) => {
  const [recipient, setRecipient] = useState({ id: 'EMP-1001', name: 'Aarav Sharma' });
  const [type, setType] = useState<'Peer' | 'Cross-functional' | 'Manager'>('Peer');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [rating, setRating] = useState<number>(4.8);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSubmitFeedback({
      fromName: isAnonymous ? 'Anonymous Colleague' : 'Elena Rostova',
      toEmployeeId: recipient.id,
      toEmployeeName: recipient.name,
      type,
      isAnonymous,
      rating,
      message: message.trim(),
      competencies: {
        teamwork: rating,
        delivery: rating,
        innovation: Math.min(5, rating + 0.1),
        collaboration: rating,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Share 360° Praise & Peer Feedback</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Recipient</label>
            <select
              value={recipient.id}
              onChange={(e) => {
                const names: Record<string, string> = {
                  'EMP-1001': 'Aarav Sharma (Principal Engineer)',
                  'EMP-1002': 'Elena Rostova (Staff Architect)',
                  'EMP-1003': 'Vikramaditya Nair (Design Lead)',
                  'EMP-1006': 'Sora Takahashi (UX Researcher)',
                };
                setRecipient({ id: e.target.value, name: names[e.target.value] || 'Colleague' });
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              <option value="EMP-1001">Aarav Sharma (Principal Engineer)</option>
              <option value="EMP-1002">Elena Rostova (Staff Architect)</option>
              <option value="EMP-1003">Vikramaditya Nair (Design Lead)</option>
              <option value="EMP-1006">Sora Takahashi (UX Researcher)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Feedback Relationship</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="Peer">Peer / Teammate</option>
                <option value="Cross-functional">Cross-functional Partner</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Overall Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value={5.0}>5.0 - Exceptional</option>
                <option value={4.8}>4.8 - Outstanding</option>
                <option value={4.5}>4.5 - Exceeds Expectations</option>
                <option value={4.0}>4.0 - Good Collaborator</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Praise / Feedback Message *</label>
            <textarea
              rows={3}
              placeholder="Highlight how this colleague helped, their technical or team contributions..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span className="text-xs text-slate-700">Submit feedback anonymously (author hidden from recipient)</span>
          </label>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow hover:bg-indigo-700"
            >
              Send Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
