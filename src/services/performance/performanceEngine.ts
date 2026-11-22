import {
  DevelopmentPlanRecord,
  Feedback360Record,
  GoalRecord,
  KeyResultItem,
  KpiRecord,
  PerformanceActivityLog,
  PerformanceOverviewMetrics,
  PerformanceReviewRecord,
  PipRecord,
  ReviewCycleRecord,
} from '../../types/performanceGoals';

export const INITIAL_GOALS: GoalRecord[] = [
  {
    id: 'GOL-2026-001',
    title: 'Migrate Core Payment Rails to Multi-Region Cluster',
    description: 'Ensure 99.995% uptime for payment dispatch engine and sub-100ms p99 latency during peak loads.',
    employeeId: 'EMP-1001',
    employeeName: 'Aarav Sharma',
    department: 'Engineering',
    assignedManager: 'Vikramaditya Nair',
    category: 'Individual',
    startDate: '2026-10-01',
    dueDate: '2026-12-31',
    priority: 'Critical',
    targetValue: 100,
    currentValue: 85,
    unit: '%',
    weightage: 35,
    progressPercentage: 85,
    status: 'On Track',
    feedbackCount: 3,
    keyResults: [
      {
        id: 'KR-101',
        title: 'Provision AWS Mumbai & Hyderabad cluster with Terraform',
        target: 100,
        current: 100,
        unit: '%',
        progressPct: 100,
      },
      {
        id: 'KR-102',
        title: 'Execute chaos testing on Redis failover cluster',
        target: 10,
        current: 9,
        unit: 'tests',
        progressPct: 90,
      },
      {
        id: 'KR-103',
        title: 'Maintain zero packet drops during peak payroll runs',
        target: 100,
        current: 65,
        unit: '%',
        progressPct: 65,
      },
    ],
  },
  {
    id: 'GOL-2026-002',
    title: 'Launch OFC360 Mobile Attendance & Shift Sync v3',
    description: 'Release high-fidelity offline clock-in and geofencing engine for remote workforce.',
    employeeId: 'EMP-1001',
    employeeName: 'Aarav Sharma',
    department: 'Engineering',
    assignedManager: 'Vikramaditya Nair',
    category: 'Team',
    startDate: '2026-10-15',
    dueDate: '2026-12-15',
    priority: 'High',
    targetValue: 100,
    currentValue: 72,
    unit: '%',
    weightage: 30,
    progressPercentage: 72,
    status: 'On Track',
    feedbackCount: 2,
    keyResults: [
      {
        id: 'KR-201',
        title: 'Complete biometric face liveness model compression',
        target: 100,
        current: 80,
        unit: '%',
        progressPct: 80,
      },
      {
        id: 'KR-202',
        title: 'Achieve app store crash-free session rate > 99.8%',
        target: 99.8,
        current: 99.4,
        unit: '%',
        progressPct: 95,
      },
      {
        id: 'KR-203',
        title: 'Run beta trial with 50 factory workforce testers in Jaipur',
        target: 50,
        current: 20,
        unit: 'users',
        progressPct: 40,
      },
    ],
  },
  {
    id: 'GOL-2026-003',
    title: 'Cloud Cost Optimization & Serverless Scaling',
    description: 'Reduce non-production EC2 & RDS cloud infrastructure footprint by 22% while retaining performance SLAs.',
    employeeId: 'EMP-1002',
    employeeName: 'Elena Rostova',
    department: 'Engineering',
    assignedManager: 'Vikramaditya Nair',
    category: 'Department',
    startDate: '2026-10-01',
    dueDate: '2026-12-31',
    priority: 'High',
    targetValue: 22,
    currentValue: 18,
    unit: '%',
    weightage: 25,
    progressPercentage: 82,
    status: 'On Track',
    feedbackCount: 4,
    keyResults: [
      {
        id: 'KR-301',
        title: 'Implement Graviton3 instance migrations for all microservices',
        target: 100,
        current: 100,
        unit: '%',
        progressPct: 100,
      },
      {
        id: 'KR-302',
        title: 'Auto-sleep dev clusters over weekends to cut AWS bill',
        target: 100,
        current: 65,
        unit: '%',
        progressPct: 65,
      },
    ],
  },
  {
    id: 'GOL-2026-004',
    title: 'Close $2.5M APAC Enterprise SaaS Pipeline',
    description: 'Secure enterprise multi-year contracts with top banking and retail accounts in Singapore & India.',
    employeeId: 'EMP-1005',
    employeeName: 'Marcus Vance',
    department: 'Sales & GTM',
    assignedManager: 'Vikramaditya Nair',
    category: 'Organizational',
    startDate: '2026-10-01',
    dueDate: '2026-12-31',
    priority: 'Critical',
    targetValue: 2.5,
    currentValue: 1.85,
    unit: '$M',
    weightage: 40,
    progressPercentage: 74,
    status: 'On Track',
    feedbackCount: 1,
    keyResults: [
      {
        id: 'KR-401',
        title: 'Sign ICICI Bank enterprise renewal',
        target: 800,
        current: 800,
        unit: '$K',
        progressPct: 100,
      },
      {
        id: 'KR-402',
        title: 'Complete Singapore regional bank proof-of-concept',
        target: 100,
        current: 50,
        unit: '%',
        progressPct: 50,
      },
    ],
  },
  {
    id: 'GOL-2026-005',
    title: 'Complete 30 On-Site Warehouse UX Field Studies',
    description: 'Gather frontline worker feedback to overhaul punch-in usability and accessibility for vernacular users.',
    employeeId: 'EMP-1006',
    employeeName: 'Sora Takahashi',
    department: 'Product & Design',
    assignedManager: 'Vikramaditya Nair',
    category: 'Development',
    startDate: '2026-10-01',
    dueDate: '2026-11-30',
    priority: 'Medium',
    targetValue: 30,
    currentValue: 28,
    unit: 'studies',
    progressPct: 93,
    progressPercentage: 93,
    status: 'Completed',
    feedbackCount: 5,
    keyResults: [
      {
        id: 'KR-501',
        title: 'Conduct field interviews in Bengaluru and Hyderabad hubs',
        target: 30,
        current: 28,
        unit: 'studies',
        progressPct: 93,
      },
      {
        id: 'KR-502',
        title: 'Publish design system accessibility guidelines v2',
        target: 100,
        current: 100,
        unit: '%',
        progressPct: 100,
      },
    ],
  },
  {
    id: 'GOL-2026-006',
    title: 'Achieve 100% Statutory Compliance & Zero Audit Deficiencies',
    description: 'Zero penalty audit record on PF, ESIC, Professional Tax and Gratuity filings across 4 states.',
    employeeId: 'EMP-1007',
    employeeName: 'Rohan Kulkarni',
    department: 'Finance & Legal',
    assignedManager: 'Vikramaditya Nair',
    category: 'Department',
    startDate: '2026-10-01',
    dueDate: '2026-12-31',
    priority: 'Critical',
    targetValue: 100,
    currentValue: 98,
    unit: '%',
    weightage: 30,
    progressPercentage: 98,
    status: 'On Track',
    feedbackCount: 2,
    keyResults: [
      {
        id: 'KR-601',
        title: 'Complete reconciliation of TDS with TRACES portal',
        target: 100,
        current: 100,
        unit: '%',
        progressPct: 100,
      },
      {
        id: 'KR-602',
        title: 'Automate Form 16 digit generation pipelines',
        target: 100,
        current: 96,
        unit: '%',
        progressPct: 96,
      },
    ],
  },
];

export const INITIAL_KPIS: KpiRecord[] = [
  {
    id: 'KPI-101',
    code: 'ENG-REL-01',
    title: 'Platform Production Reliability (SLA)',
    category: 'Engineering Quality',
    target: 99.95,
    actual: 99.98,
    unit: '%',
    weightage: 25,
    achievementPct: 100.03,
    score: 4.8,
    department: 'Engineering',
    employeeId: 'EMP-1001',
    employeeName: 'Aarav Sharma',
  },
  {
    id: 'KPI-102',
    code: 'ENG-SPR-02',
    title: 'Sprint Velocity & Story Point Completion',
    category: 'Delivery Speed',
    target: 85,
    actual: 82,
    unit: 'pts',
    weightage: 25,
    achievementPct: 96.47,
    score: 4.3,
    department: 'Engineering',
    employeeId: 'EMP-1001',
    employeeName: 'Aarav Sharma',
  },
  {
    id: 'KPI-103',
    code: 'ENG-SEC-03',
    title: 'Mean Time to Remediate Security Vulnerabilities',
    category: 'Security & Compliance',
    target: 48,
    actual: 32,
    unit: 'hrs',
    weightage: 20,
    achievementPct: 133.33,
    score: 4.9,
    department: 'Engineering',
    employeeId: 'EMP-1002',
    employeeName: 'Elena Rostova',
  },
  {
    id: 'KPI-104',
    code: 'SLS-QUO-01',
    title: 'Quarterly Sales Quota Attainment',
    category: 'Revenue Generation',
    target: 100,
    actual: 94,
    unit: '%',
    weightage: 35,
    achievementPct: 94,
    score: 4.2,
    department: 'Sales & GTM',
    employeeId: 'EMP-1005',
    employeeName: 'Marcus Vance',
  },
  {
    id: 'KPI-105',
    code: 'PRD-SAT-01',
    title: 'Product Usability Score (SUS Benchmarks)',
    category: 'User Experience',
    target: 85,
    actual: 89,
    unit: 'score',
    weightage: 30,
    achievementPct: 104.7,
    score: 4.7,
    department: 'Product & Design',
    employeeId: 'EMP-1006',
    employeeName: 'Sora Takahashi',
  },
  {
    id: 'KPI-106',
    code: 'FIN-AUD-01',
    title: 'Statutory Payroll Compliance Index',
    category: 'Statutory Governance',
    target: 99.0,
    actual: 99.6,
    unit: '%',
    weightage: 30,
    achievementPct: 100.6,
    score: 4.9,
    department: 'Finance & Legal',
    employeeId: 'EMP-1007',
    employeeName: 'Rohan Kulkarni',
  },
];

export const INITIAL_REVIEW_CYCLES: ReviewCycleRecord[] = [
  {
    id: 'CYC-2026-Q4',
    title: 'Q4 2026 Performance Appraisal & OKR Sprint',
    type: 'Quarterly',
    startDate: '2026-11-01',
    endDate: '2026-12-15',
    status: 'Active',
    eligibleEmployees: 348,
    completionRatePct: 68,
  },
  {
    id: 'CYC-2026-H2',
    title: 'H2 Mid-Year Leadership Calibration',
    type: 'Half-Yearly',
    startDate: '2026-07-01',
    endDate: '2026-08-15',
    status: 'Completed',
    eligibleEmployees: 320,
    completionRatePct: 100,
  },
  {
    id: 'CYC-2027-FY',
    title: 'FY27 Annual Promotion & Compensation Review',
    type: 'Annual',
    startDate: '2027-03-01',
    endDate: '2027-04-15',
    status: 'Upcoming',
    eligibleEmployees: 360,
    completionRatePct: 0,
  },
];

export const INITIAL_REVIEWS: PerformanceReviewRecord[] = [
  {
    id: 'REV-2026-001',
    cycleId: 'CYC-2026-Q4',
    cycleTitle: 'Q4 2026 Performance Appraisal',
    employeeId: 'EMP-1001',
    employeeName: 'Aarav Sharma',
    department: 'Engineering',
    designation: 'Principal Product Engineer',
    managerName: 'Vikramaditya Nair',
    stage: 'Manager Evaluation',
    selfScore: 4.6,
    selfComments: 'Spearheaded zero-downtime database cutover and designed frontend mobile modules with extreme speed.',
    strengths: ['High architectural discipline', 'Quick resolution of critical edge cases', 'Mentoring junior devs'],
    improvementAreas: ['More proactive documentation on deployment runbooks'],
    evaluationCriteria: {
      goalAchievement: 4.5,
      kpiAchievement: 4.7,
      qualityOfWork: 4.8,
      communication: 4.2,
      teamwork: 4.7,
      leadership: 4.6,
      problemSolving: 4.9,
    },
    submittedAt: '2026-11-05 02:30 PM',
  },
  {
    id: 'REV-2026-002',
    cycleId: 'CYC-2026-Q4',
    cycleTitle: 'Q4 2026 Performance Appraisal',
    employeeId: 'EMP-1002',
    employeeName: 'Elena Rostova',
    department: 'Engineering',
    designation: 'Staff Cloud Architect',
    managerName: 'Vikramaditya Nair',
    stage: 'Self Assessment',
    strengths: ['Cloud infrastructure expertise', 'Cost optimization'],
    improvementAreas: ['Stakeholder alignment across non-technical teams'],
    evaluationCriteria: {
      goalAchievement: 4.2,
      kpiAchievement: 4.5,
      qualityOfWork: 4.7,
      communication: 4.0,
      teamwork: 4.3,
      leadership: 4.4,
      problemSolving: 4.8,
    },
  },
  {
    id: 'REV-2026-003',
    cycleId: 'CYC-2026-Q4',
    cycleTitle: 'Q4 2026 Performance Appraisal',
    employeeId: 'EMP-1005',
    employeeName: 'Marcus Vance',
    department: 'Sales & GTM',
    designation: 'Enterprise Account Director',
    managerName: 'Vikramaditya Nair',
    stage: 'HR Review',
    selfScore: 4.5,
    managerScore: 4.6,
    finalRating: 4.6,
    selfComments: 'Exceeded regional quarterly target through BFSI key accounts expansion.',
    managerComments: 'Exceptional client relationship building and strategic deal structuring.',
    hrComments: 'Approved for Q4 incentive bonus tier 1.',
    strengths: ['High impact dealmaker', 'Cross-border enterprise sales'],
    improvementAreas: ['CRM hygiene and pipeline status updates'],
    evaluationCriteria: {
      goalAchievement: 4.8,
      kpiAchievement: 4.6,
      qualityOfWork: 4.4,
      communication: 4.9,
      teamwork: 4.4,
      leadership: 4.7,
      problemSolving: 4.5,
    },
    submittedAt: '2026-11-08 11:00 AM',
  },
  {
    id: 'REV-2026-004',
    cycleId: 'CYC-2026-Q4',
    cycleTitle: 'Q4 2026 Performance Appraisal',
    employeeId: 'EMP-1006',
    employeeName: 'Sora Takahashi',
    department: 'Product & Design',
    designation: 'Senior UX Researcher',
    managerName: 'Vikramaditya Nair',
    stage: 'Finalized',
    selfScore: 4.8,
    managerScore: 4.9,
    finalRating: 4.9,
    selfComments: 'Completed 30 warehouse field research trials with exceptional customer feedback.',
    managerComments: 'Outstanding empathy and translation of complex field needs into clean wireframes.',
    hrComments: 'Promoted to Lead UX Strategist effective Dec 1.',
    strengths: ['User empathy', 'Research rigor', 'High collaborative energy'],
    improvementAreas: ['Data-driven quantitative analytics pairing'],
    evaluationCriteria: {
      goalAchievement: 5.0,
      kpiAchievement: 4.9,
      qualityOfWork: 4.9,
      communication: 4.8,
      teamwork: 4.9,
      leadership: 4.7,
      problemSolving: 4.8,
    },
    submittedAt: '2026-11-01 10:00 AM',
    finalizedAt: '2026-11-10 04:00 PM',
  },
];

export const INITIAL_360_FEEDBACK: Feedback360Record[] = [
  {
    id: 'FB-2026-01',
    fromName: 'Vikramaditya Nair',
    toEmployeeId: 'EMP-1001',
    toEmployeeName: 'Aarav Sharma',
    type: 'Manager',
    isAnonymous: false,
    rating: 4.8,
    message: 'Aarav consistently delivers high-velocity, reliable code. His proactive communication during sprint blockers keeps the whole engineering unit motivated.',
    date: '2026-11-09',
    competencies: {
      teamwork: 4.8,
      delivery: 5.0,
      innovation: 4.6,
      collaboration: 4.7,
    },
  },
  {
    id: 'FB-2026-02',
    fromName: 'Elena Rostova',
    toEmployeeId: 'EMP-1001',
    toEmployeeName: 'Aarav Sharma',
    type: 'Peer',
    isAnonymous: false,
    rating: 4.7,
    message: 'Awesome collaborator on the multi-region cluster design. Very fast at resolving API contract mismatches.',
    date: '2026-11-06',
    competencies: {
      teamwork: 4.9,
      delivery: 4.8,
      innovation: 4.5,
      collaboration: 4.8,
    },
  },
  {
    id: 'FB-2026-03',
    fromName: 'Anonymous Colleague',
    toEmployeeId: 'EMP-1001',
    toEmployeeName: 'Aarav Sharma',
    type: 'Cross-functional',
    isAnonymous: true,
    rating: 4.6,
    message: 'Always open to constructive feedback. Makes our mobile UI feel effortless.',
    date: '2026-11-04',
    competencies: {
      teamwork: 4.7,
      delivery: 4.6,
      innovation: 4.8,
      collaboration: 4.5,
    },
  },
  {
    id: 'FB-2026-04',
    fromName: 'Sora Takahashi',
    toEmployeeId: 'EMP-1003',
    toEmployeeName: 'Vikramaditya Nair',
    type: 'Peer',
    isAnonymous: false,
    rating: 4.9,
    message: 'Vikram provides balanced mentorship and protects team focus so engineers and designers can execute without distraction.',
    date: '2026-11-02',
    competencies: {
      teamwork: 5.0,
      delivery: 4.8,
      innovation: 4.9,
      collaboration: 5.0,
    },
  },
];

export const INITIAL_PIPS: PipRecord[] = [
  {
    id: 'PIP-2026-01',
    employeeId: 'EMP-1008',
    employeeName: 'Devansh Verma',
    department: 'Customer Success',
    assignedMentor: 'Vikramaditya Nair',
    startDate: '2026-10-15',
    reviewDate: '2026-12-15',
    objectives: [
      'Maintain CSAT score > 88% over 30 days',
      'Resolve ticket escalations within 4-hour SLA window',
      'Complete OFC360 enterprise technical training',
    ],
    performanceGaps: [
      'Inconsistent first response time on high-tier support tickets',
      'Delayed ticket escalation to core product team',
    ],
    actionPlan: [
      'Daily 15-minute morning standup with mentor',
      'Shadow senior support engineers on enterprise accounts',
      'Weekly case review sessions',
    ],
    progressPct: 65,
    status: 'Active',
    managerComments: 'Showing steady improvement in first-response speed. CSAT improved from 74% to 84% in past two weeks.',
  },
];

export const INITIAL_DEVELOPMENT_PLANS: DevelopmentPlanRecord[] = [
  {
    id: 'DEV-101',
    employeeId: 'EMP-1001',
    employeeName: 'Aarav Sharma',
    skillTitle: 'Cloud Distributed Systems & Event Sourcing',
    currentLevel: 'Intermediate',
    targetLevel: 'Expert',
    recommendedTraining: 'O\'Reilly Distributed Systems Mastery & Kafka Enterprise Architect',
    progressPct: 75,
    milestones: [
      { title: 'Complete Apache Kafka event streaming certification', completed: true },
      { title: 'Author internal technical whitepaper on multi-region failover', completed: true },
      { title: 'Lead end-to-end chaos engineering simulation in staging', completed: false },
    ],
  },
  {
    id: 'DEV-102',
    employeeId: 'EMP-1001',
    employeeName: 'Aarav Sharma',
    skillTitle: 'Executive Presence & Cross-Functional Leadership',
    currentLevel: 'Intermediate',
    targetLevel: 'Proficient',
    recommendedTraining: 'Harvard ManageMentor Strategic Leadership Workshop',
    progressPct: 60,
    milestones: [
      { title: 'Present quarterly product roadmap to C-suite', completed: true },
      { title: 'Mentor 2 junior associate engineers through promotion cycle', completed: true },
      { title: 'Complete 360-degree leadership assessment', completed: false },
    ],
  },
];

export const INITIAL_PERFORMANCE_LOGS: PerformanceActivityLog[] = [
  {
    id: 'LOG-PF-01',
    actor: 'Aarav Sharma',
    action: 'Goal Progress Updated',
    target: 'GOL-2026-001 (Multi-Region Cluster)',
    timestamp: '2026-11-10 03:15 PM',
    details: 'Updated Redis failover cluster completion to 90%',
  },
  {
    id: 'LOG-PF-02',
    actor: 'Vikramaditya Nair',
    action: 'Performance Review Completed',
    target: 'REV-2026-004 (Sora Takahashi)',
    timestamp: '2026-11-10 04:00 PM',
    details: 'Submitted final manager evaluation score of 4.9 / 5.0 with promotion endorsement',
  },
  {
    id: 'LOG-PF-03',
    actor: 'Elena Rostova',
    action: '360 Peer Feedback Submitted',
    target: 'Aarav Sharma',
    timestamp: '2026-11-06 11:20 AM',
    details: 'Submitted positive peer review on payment engine architecture',
  },
];

// Pure Helper Calculations
export function calculateGoalOverallProgress(keyResults: KeyResultItem[]): number {
  if (!keyResults || keyResults.length === 0) return 0;
  const total = keyResults.reduce((acc, curr) => acc + (curr.progressPct || 0), 0);
  return Math.min(100, Math.round(total / keyResults.length));
}

export function calculateKpiScore(
  target: number,
  actual: number,
  weightage = 20
): { achievementPct: number; weightedScore: number } {
  if (target <= 0) return { achievementPct: 100, weightedScore: 5.0 };
  const achievementPct = Math.min(200, Number(((actual / target) * 100).toFixed(1)));
  // Score on 1-5 scale
  const rawScore = Math.min(5, Math.max(1, (achievementPct / 100) * 4 + 1));
  const weightedScore = Number(((rawScore * weightage) / 100).toFixed(2));
  return { achievementPct, weightedScore };
}

export function computeEmployeePerformanceScore(
  goals: GoalRecord[],
  kpis: KpiRecord[]
): {
  overallScore: number;
  grade: string;
  onTrackRatio: number;
  totalGoals: number;
  completedGoals: number;
} {
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === 'Completed').length;
  const onTrackGoals = goals.filter((g) => g.status === 'On Track' || g.status === 'Completed').length;
  const onTrackRatio = totalGoals > 0 ? Math.round((onTrackGoals / totalGoals) * 100) : 100;

  // Average goal progress
  const avgGoalProgress =
    totalGoals > 0
      ? goals.reduce((acc, g) => acc + (g.progressPercentage || 0), 0) / totalGoals
      : 80;

  // Average KPI score (out of 5)
  const avgKpiScore =
    kpis.length > 0 ? kpis.reduce((acc, k) => acc + (k.score ?? 4.5), 0) / kpis.length : 4.5;

  // Blended 1-5 score: 60% Goals, 40% KPIs
  const goalScoreOut5 = (avgGoalProgress / 100) * 4 + 1;
  const blendedScore = Number((goalScoreOut5 * 0.6 + avgKpiScore * 0.4).toFixed(2));

  let grade = 'Proficient (Meets Expectations)';
  if (blendedScore >= 4.6) grade = 'Exceptional (Top Performer)';
  else if (blendedScore >= 4.2) grade = 'Exceeds Expectations';
  else if (blendedScore < 3.0) grade = 'Needs Improvement';

  return {
    overallScore: blendedScore,
    grade,
    onTrackRatio,
    totalGoals,
    completedGoals,
  };
}

export function calculateDepartmentPerformanceBreakdown(
  goals: GoalRecord[],
  reviews: PerformanceReviewRecord[]
): Array<{ department: string; avgRating: number; goalProgressPct: number; headcount: number }> {
  const departments = ['Engineering', 'Product & Design', 'Sales & GTM', 'Finance & Legal'];

  return departments.map((dept) => {
    const deptGoals = goals.filter((g) => g.department === dept);
    const deptReviews = reviews.filter((r) => r.department === dept);

    const goalProgressPct =
      deptGoals.length > 0
        ? Math.round(
            deptGoals.reduce((acc, g) => acc + (g.progressPercentage ?? g.progress ?? 0), 0) / deptGoals.length
          )
        : 80;

    const ratedReviews = deptReviews.filter((r) => r.finalRating || r.selfScore);
    const avgRating =
      ratedReviews.length > 0
        ? Number(
            (
              ratedReviews.reduce((acc, r) => acc + (r.finalRating || r.selfScore || 4), 0) /
              ratedReviews.length
            ).toFixed(1)
          )
        : 4.4;

    return {
      department: dept,
      avgRating,
      goalProgressPct,
      headcount: dept === 'Engineering' ? 142 : dept === 'Sales & GTM' ? 88 : dept === 'Product & Design' ? 64 : 54,
    };
  });
}

// Aliases for convenient consumption across workspace shells
export const SEED_GOALS = INITIAL_GOALS;
export const SEED_KPIS = INITIAL_KPIS;
export const SEED_REVIEW_CYCLES = INITIAL_REVIEW_CYCLES;
export const SEED_PERFORMANCE_REVIEWS = INITIAL_REVIEWS;
export const SEED_360_FEEDBACKS = INITIAL_360_FEEDBACK;
export const SEED_PIPS = INITIAL_PIPS;
export const SEED_DEVELOPMENT_PLANS = INITIAL_DEVELOPMENT_PLANS;
export const SEED_ACTIVITY_LOGS = INITIAL_PERFORMANCE_LOGS;
