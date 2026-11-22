export type PerformanceRole = 'employee' | 'manager' | 'hr_admin' | 'executive' | 'it_admin' | 'Employee' | 'Manager' | 'HR Admin' | 'Executive' | 'IT Admin';

export type GoalCategory =
  | 'Individual'
  | 'Team'
  | 'Department'
  | 'Organizational'
  | 'Development';

export type GoalPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type GoalStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Active'
  | 'On Track'
  | 'At Risk'
  | 'Delayed'
  | 'Completed'
  | 'Cancelled';

export interface KeyResultItem {
  id: string;
  title: string;
  target?: number;
  targetValue?: number;
  current?: number;
  currentValue?: number;
  unit: string;
  progressPct?: number;
}

export interface GoalRecord {
  id: string;
  title: string;
  description: string;
  employeeId?: string;
  ownerId?: string;
  employeeName?: string;
  ownerName?: string;
  department: string;
  assignedManager?: string;
  category: GoalCategory;
  startDate: string;
  dueDate: string;
  priority?: GoalPriority;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  weightage?: number; // e.g. 25%
  keyResults: KeyResultItem[];
  progressPercentage?: number;
  progress?: number;
  progressPct?: number;
  status: GoalStatus;
  feedbackCount?: number;
  commentsCount?: number;
  alignedOrgGoalId?: string;
}

export interface KpiRecord {
  id: string;
  code?: string;
  name?: string;
  title?: string;
  category?: string;
  description?: string;
  target: number;
  actual: number;
  unit: string;
  weightage: number; // e.g. 20%
  achievementPct?: number;
  score?: number; // 1-5 scale or percentage
  department: string;
  employeeId?: string;
  employeeName?: string;
}

export type ReviewCycleType = 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annual' | 'Custom';

export interface ReviewCycleRecord {
  id: string;
  title: string;
  type?: ReviewCycleType;
  frequency?: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Upcoming' | 'Completed' | string;
  eligibleEmployees?: number;
  totalReviews?: number;
  completionRatePct?: number;
  completionRate?: number;
}

export type ReviewStage =
  | 'Self Assessment'
  | 'Manager Review'
  | 'Manager Evaluation'
  | 'HR Review'
  | 'HR Calibration'
  | 'Finalized';

export interface PerformanceReviewRecord {
  id: string;
  cycleId?: string;
  cycleTitle?: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation?: string;
  role?: string;
  managerName: string;
  stage?: ReviewStage;
  status?: string;
  selfScore?: number;
  managerScore?: number;
  finalRating?: number; // 1.0 to 5.0
  selfComments?: string;
  selfNarrative?: string;
  managerComments?: string;
  managerFeedback?: string;
  promotionRecommended?: boolean;
  hrComments?: string;
  strengths?: string[];
  improvementAreas?: string[];
  submittedAt?: string;
  finalizedAt?: string;
  evaluationCriteria?: {
    goalAchievement: number;
    kpiAchievement: number;
    qualityOfWork: number;
    communication: number;
    teamwork: number;
    leadership: number;
    problemSolving: number;
  };
}

export type FeedbackType = 'Peer' | 'Manager' | 'Self' | 'Cross-functional';

export interface Feedback360Record {
  id: string;
  fromName?: string;
  fromUserId?: string;
  fromUserName?: string;
  fromRole?: string;
  toUserId?: string;
  toEmployeeId?: string;
  toUserName?: string;
  toEmployeeName?: string;
  relationship?: string;
  type?: FeedbackType;
  isAnonymous: boolean;
  rating: number; // 1-5
  message?: string;
  comments?: string;
  strengths?: string[];
  improvementAreas?: string[];
  date: string;
  competencies?: {
    teamwork: number;
    delivery: number;
    innovation: number;
    collaboration: number;
  };
}

export type PipStatus = 'Active' | 'Successful' | 'Completed' | 'Extended' | 'Escalated';

export interface PipRecord {
  id: string;
  employeeId?: string;
  employeeName: string;
  department: string;
  assignedMentor?: string;
  mentorName?: string;
  startDate?: string;
  reviewDate?: string;
  durationDays?: number;
  reason?: string;
  objectives?: string[];
  performanceGaps?: string[];
  actionPlan?: string[];
  milestones?: any[];
  progressPct?: number;
  status: PipStatus | string;
  managerComments?: string;
}

export interface DevelopmentPlanRecord {
  id: string;
  employeeId?: string;
  employeeName?: string;
  skillTitle?: string;
  skill?: string;
  currentLevel?: 'Beginner' | 'Intermediate' | 'Proficient' | string;
  targetLevel?: 'Intermediate' | 'Proficient' | 'Expert' | string;
  recommendedTraining?: string;
  milestones?: { title?: string; name?: string; completed: boolean }[];
  progressPct?: number;
  progress?: number;
}

export interface PerformanceActivityLog {
  id: string;
  actor?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  action: string;
  target?: string;
  timestamp: string;
  details: string;
}

export interface PerformanceOverviewMetrics {
  overallScore: number;
  goalsCompletedCount: number;
  totalGoalsCount: number;
  goalsCompletionRate: number;
  kpiAverageScore: number;
  reviewsPendingCount: number;
  pipActiveCount: number;
}
