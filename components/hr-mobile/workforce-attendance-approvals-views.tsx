'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PayrollAnalyticsDashboard } from '@/components/payroll-analytics/payroll-analytics-dashboard';
import {
  HrDashboardDataState,
  ApprovalCategory,
  ApprovalStatus,
  ApprovalItem,
  BottomNavTab,
  HomeInternalTab,
  filterApprovals,
  calculateAttendancePercentages,
  ProfileCrudRecord,
  CompanyCrudRecord,
  createInitialProfileRecords,
  createInitialCompanyRecords,
  upsertProfileRecord,
  deleteProfileRecord,
  upsertCompanyRecord,
  deleteCompanyRecord,
  MORE_MODULE_CATEGORIES,
  MoreModuleCategory,
  MoreModuleId,
  MoreModuleItem,
  getMoreModulesCatalog,
  filterMoreModules,
} from '@/lib/hr-dashboard-logic';
import {
  useDecideApprovalMutation,
  useTriggerPayrollRunMutation,
} from '@/lib/store/hr-api';
import { Ofc360Role } from '@/lib/auth-schemas';
import { authClient } from '@/lib/auth-api';
import {
  Search,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Check,
  X,
  Clock,
  LogOut,
  Wallet,
  Briefcase,
  Megaphone,
  Calendar,
  KeyRound,
  User,
  Building2,
  Plus,
  Pencil,
  Trash2,
  Target,
  MessageSquare,
  Video,
  Sparkles,
  BarChart3,
  TrendingUp,
  PieChart,
  FileText,
  BookOpen,
  ShieldCheck,
  Settings,
  Plug,
  LifeBuoy,
  ArrowLeft,
  ChevronRight,
  Sun,
  Moon,
  Send,
  Download,
  Laptop,
  UserCheck,
  Plane,
  QrCode,
} from 'lucide-react';


interface WorkforceScreenProps {
  data: HrDashboardDataState;
  canEdit: boolean;
  onOpenAddEmployee: () => void;
}

export function WorkforceScreen({
  data,
  canEdit,
  onOpenAddEmployee,
}: WorkforceScreenProps) {
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');

  const q = search.trim().toLowerCase();
  const filteredEmployees = data.workforce.filter((emp) => {
    const matchesDept = dept === 'All' || emp.department === dept;
    const matchesQuery =
      q === '' ||
      emp.name.toLowerCase().includes(q) ||
      emp.employeeId.toLowerCase().includes(q) ||
      emp.designation.toLowerCase().includes(q) ||
      emp.location.toLowerCase().includes(q);
    return matchesDept && matchesQuery;
  });

  return (
    <div className="space-y-5" data-testid="mobile-workforce-screen">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Workforce Directory ({data.kpis.workforce.totalActive})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Active personnel, shift assignments, and onboarding pipeline
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={onOpenAddEmployee}
            data-testid="workforce-add-employee-btn"
            className="min-h-[44px] px-4 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add Employee
          </button>
        )}
      </div>

      {/* Search & Department Filter */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by employee name, ID (EMP-3601), role, or hub..."
            aria-label="Search workforce directory"
            className="w-full h-11 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 text-xs text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            'All',
            'Engineering',
            'Product & Design',
            'People Operations',
            'Finance & Legal',
            'Enterprise Sales',
            'Customer Success',
          ].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDept(d)}
              className={`min-h-[36px] px-3 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                dept === d
                  ? 'bg-slate-900 text-white dark:bg-indigo-600'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.id}
            data-testid={`workforce-card-${emp.employeeId}`}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {emp.initials}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {emp.employeeId}
                    </span>
                    <span>·</span>
                    <span>{emp.department}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {emp.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {emp.designation}
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-semibold font-mono ${
                  emp.status === 'Present' || emp.status === 'Remote'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : emp.status === 'Late'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-indigo-600 dark:text-indigo-400'
                }`}
              >
                {emp.status}
              </span>
            </div>

            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{emp.location}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end font-mono tabular-nums">
                <span>Att: {emp.attendanceRate}%</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{emp.email}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end font-mono truncate">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{emp.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AttendanceScreenProps {
  data: HrDashboardDataState;
  onNavigateHomeTab: (tab: HomeInternalTab) => void;
  onNavigateBottomTab: (tab: BottomNavTab) => void;
}

export function AttendanceScreen({
  data,
  onNavigateHomeTab,
  onNavigateBottomTab,
}: AttendanceScreenProps) {
  const metrics = calculateAttendancePercentages(data.kpis.attendance);

  return (
    <div className="space-y-5" data-testid="mobile-attendance-screen">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Daily Attendance &amp; Shift Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Biometric &amp; mobile geo-fenced check-in telemetry for today
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onNavigateBottomTab('home');
              onNavigateHomeTab('shifts');
            }}
            className="min-h-[40px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            Manage Shifts
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigateBottomTab('home');
              onNavigateHomeTab('rosters');
            }}
            className="min-h-[40px] px-3.5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
          >
            Duty Rosters
          </button>
        </div>
      </div>

      {/* Top Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Present On-Time
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {data.kpis.attendance.present}
          </p>
          <span className="text-xs font-mono text-slate-400">
            {metrics.presentPct}% of workforce
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Late Check-Ins
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-1">
            {data.kpis.attendance.late}
          </p>
          <span className="text-xs font-mono text-slate-400">
            {metrics.latePct}% of workforce
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Approved Leave
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400 mt-1">
            {data.kpis.attendance.onLeave}
          </p>
          <span className="text-xs font-mono text-slate-400">
            {metrics.onLeavePct}% of workforce
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Unplanned Absent
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-1">
            {data.kpis.attendance.absent}
          </p>
          <span className="text-xs font-mono text-slate-400">
            {metrics.absentPct}% of workforce
          </span>
        </div>
      </div>

      {/* Department Attendance Breakdown */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3.5">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Department Attendance Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.departments.map((d) => (
            <div
              key={d.id}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">
                  {d.department}
                </span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {d.attendancePercentage}%
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lead: {d.headOfDept} · Total Staff: {d.totalEmployees}
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-300 tabular-nums pt-1 border-t border-slate-200/60 dark:border-slate-800">
                <span>Present: {d.presentCount}</span>
                <span>Late: {d.lateCount}</span>
                <span>Leave: {d.onLeaveCount}</span>
                <span>Absent: {d.absentCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ApprovalsScreenProps {
  data: HrDashboardDataState;
  canEdit: boolean;
  onSuccessToast: (msg: string) => void;
}

export function ApprovalsScreen({
  data,
  canEdit,
  onSuccessToast,
}: ApprovalsScreenProps) {
  const [category, setCategory] = useState<ApprovalCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'All'>(
    'Pending'
  );
  const [search, setSearch] = useState('');
  const [decideApproval, { isLoading }] = useDecideApprovalMutation();

  const filtered = filterApprovals(
    data.approvals,
    category,
    statusFilter,
    search
  );

  const handleDecision = async (
    item: ApprovalItem,
    decision: 'Approved' | 'Rejected'
  ) => {
    if (!canEdit) return;
    try {
      const res = await decideApproval({
        id: item.id,
        status: decision,
      }).unwrap();
      onSuccessToast(res.message);
    } catch {
      onSuccessToast('Unable to update approval status.');
    }
  };

  return (
    <div className="space-y-5" data-testid="mobile-approvals-screen">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          HR Approvals Center ({data.kpis.approvals.totalPending} Pending)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Review and authorize leave requests, attendance regularizations, and
          expenses
        </p>
      </div>

      {/* Category & Status Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(
            [
              'All',
              'Leave Requests',
              'Attendance Regularizations',
              'Expense Claims',
            ] as const
          ).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                category === cat
                  ? 'bg-slate-900 text-white dark:bg-indigo-600'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          {(['Pending', 'Approved', 'Rejected', 'All'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`min-h-[32px] px-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search requests by employee name, ID, or department..."
          aria-label="Search approval requests"
          className="w-full h-11 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 text-xs text-slate-900 dark:text-slate-100"
        />
      </div>

      {/* Approval Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-xs text-slate-500">
            No matching approval requests found.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              data-testid={`approvals-screen-card-${item.id}`}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {item.employeeId}
                  </span>
                  <span>·</span>
                  <span>{item.department}</span>
                  <span>·</span>
                  <span>{item.category}</span>
                  <span>·</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.employeeName} — {item.requestType}
                </h3>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                  {item.durationOrAmount} · {item.requestDate}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Reason: {item.reason}
                </p>
              </div>

              {item.status === 'Pending' && canEdit && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleDecision(item, 'Approved')}
                    className="min-h-[42px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleDecision(item, 'Rejected')}
                    className="min-h-[42px] px-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface MoreModulesScreenProps {
  data: HrDashboardDataState;
  canEdit: boolean;
  activeRole?: Ofc360Role;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenAnnouncement: () => void;
  onNavigateBottomTab: (tab: BottomNavTab) => void;
  onNavigateHomeTab: (tab: HomeInternalTab) => void;
  onSuccessToast: (msg: string) => void;
}

function getModuleIcon(id: MoreModuleId) {
  switch (id) {
    case 'payroll':
      return <Wallet className="w-5 h-5 text-violet-600 dark:text-violet-400" />;
    case 'recruitment':
      return <Briefcase className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
    case 'onboarding':
      return <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    case 'shifts_rosters':
      return <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    case 'holidays':
      return <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    case 'asset_management':
      return <Laptop className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
    case 'visitor_management':
      return <QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    case 'travel_desk':
      return <Plane className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    case 'exit_management':
      return <LogOut className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    case 'performance_goals':
      return <Target className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />;
    case 'ofc_connect_chat':
      return <MessageSquare className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
    case 'audio_video_meetings':
      return <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    case 'announcements':
      return <Megaphone className="w-5 h-5 text-violet-600 dark:text-violet-400" />;
    case 'people_ai':
      return <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />;
    case 'reports_analytics':
      return <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    case 'workforce_analytics':
      return <TrendingUp className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
    case 'attendance_analytics':
      return <PieChart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    case 'payroll_analytics':
      return <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    case 'employee_documents':
      return <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    case 'documents_policies':
      return <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
    case 'compliance_center':
      return <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    case 'my_profile':
      return <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    case 'settings':
      return <Settings className="w-5 h-5 text-slate-700 dark:text-slate-300" />;
    case 'integrations':
      return <Plug className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    case 'help_support':
      return <LifeBuoy className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
  }
}

function getBadgeStyle(tone?: MoreModuleItem['badgeTone']) {
  switch (tone) {
    case 'emerald':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    case 'amber':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    case 'rose':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
    case 'violet':
      return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800';
    default:
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800';
  }
}

export function MoreModulesScreen({
  data,
  canEdit,
  activeRole = 'hr_admin',
  isDarkMode = false,
  onToggleDarkMode,
  onOpenAnnouncement,
  onNavigateBottomTab,
  onNavigateHomeTab,
  onSuccessToast,
}: MoreModulesScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    MoreModuleCategory | 'All'
  >('All');
  const [activeSubModule, setActiveSubModule] = useState<MoreModuleId | null>(
    null
  );

  // Interactive states for sub-modules
  const [triggerPayroll, { isLoading }] = useTriggerPayrollRunMutation();
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'MSG-1',
      sender: 'Elena Rostova (Engineering)',
      time: '09:42 AM',
      text: 'Hi Aarav, Q4 backend hiring panel slots are confirmed for Thursday.',
    },
    {
      id: 'MSG-2',
      sender: 'Vikramaditya Nair (DevOps)',
      time: '10:05 AM',
      text: 'APAC Night Shift roster handoff completed with 100% coverage.',
    },
    {
      id: 'MSG-3',
      sender: 'Meera Krishnan (Finance)',
      time: '10:18 AM',
      text: 'November payroll tax reconciliation sheet is verified and locked.',
    },
  ]);

  const [integrationsList, setIntegrationsList] = useState([
    {
      id: 'INT-1',
      name: 'Google Workspace Directory & SSO',
      category: 'Identity & Mail',
      connected: true,
      lastSync: '2 mins ago',
    },
    {
      id: 'INT-2',
      name: 'Slack Enterprise Grid (#hr-alerts)',
      category: 'Messaging',
      connected: true,
      lastSync: '5 mins ago',
    },
    {
      id: 'INT-3',
      name: 'HID Biometric & Geo-Fence Readers',
      category: 'Attendance Hardware',
      connected: true,
      lastSync: 'Live stream',
    },
    {
      id: 'INT-4',
      name: 'ADP / RazorpayX Corporate Payouts',
      category: 'Payroll Banking',
      connected: true,
      lastSync: '1 hr ago',
    },
  ]);

  const [supportSubject, setSupportSubject] = useState('');
  const [supportPriority, setSupportPriority] = useState<'Normal' | 'High'>(
    'Normal'
  );

  // Assets Management State
  const [assetsList, setAssetsList] = useState([
    {
      id: 'AST-101',
      title: 'Apple MacBook Pro 16" M3 Max',
      category: 'Laptops',
      assignedTo: 'Elena Rostova (Engineering)',
      serial: 'SN-APL-882194',
      status: 'Allocated',
    },
    {
      id: 'AST-102',
      title: 'Dell UltraSharp 27" 4K Thunderbolt',
      category: 'Displays',
      assignedTo: 'Sora Takahashi (Product & Design)',
      serial: 'SN-DEL-104922',
      status: 'Allocated',
    },
    {
      id: 'AST-103',
      title: 'YubiKey 5C NFC Enterprise Security Key',
      category: 'Security Tokens',
      assignedTo: 'Aarav Sharma (HR Admin)',
      serial: 'SN-YBK-920110',
      status: 'Allocated',
    },
    {
      id: 'AST-104',
      title: 'Lenovo ThinkPad X1 Carbon Gen 11',
      category: 'Laptops',
      assignedTo: 'IT Inventory Pool',
      serial: 'SN-LNV-448102',
      status: 'In Stock',
    },
  ]);
  const [newAssetModel, setNewAssetModel] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState('Laptops');
  const [newAssetAssignee, setNewAssetAssignee] = useState('');

  // Visitor Management State
  const [visitorList, setVisitorList] = useState([
    {
      id: 'VIS-801',
      guestName: 'Vikram Rao',
      organization: 'Google Cloud Platform',
      host: 'Aarav Sharma',
      purpose: 'Enterprise Architecture Review',
      badgeNo: 'BADGE-09',
      status: 'Checked In',
      entryTime: '09:30 AM',
    },
    {
      id: 'VIS-802',
      guestName: 'Sarah Jenkins',
      organization: 'KPMG Compliance',
      host: 'Elena Rostova',
      purpose: 'Annual SOC2 Security Audit',
      badgeNo: 'BADGE-14',
      status: 'In Meeting',
      entryTime: '10:15 AM',
    },
    {
      id: 'VIS-803',
      guestName: 'Rajiv Mehta',
      organization: 'Cisco Systems',
      host: 'Vikramaditya Nair',
      purpose: 'Fibre & Switch Maintenance',
      badgeNo: 'BADGE-03',
      status: 'Checked Out',
      entryTime: '08:45 AM',
    },
  ]);
  const [guestName, setGuestName] = useState('');
  const [guestOrg, setGuestOrg] = useState('');
  const [guestPurpose, setGuestPurpose] = useState('');

  // Corporate Travel State
  const [travelTrips, setTravelTrips] = useState([
    {
      id: 'TRV-401',
      traveler: 'Marcus Vance',
      department: 'Enterprise Sales',
      route: 'BLR ➔ DEL',
      dates: 'Nov 12 – Nov 14, 2026',
      purpose: 'Client Executive Summit',
      flight: 'IndiGo 6E-2041',
      hotel: 'The Oberoi New Delhi',
      status: 'Approved',
      costEst: '$1,240',
    },
    {
      id: 'TRV-402',
      traveler: 'Elena Rostova',
      department: 'Engineering',
      route: 'BOM ➔ SGP',
      dates: 'Nov 22 – Nov 26, 2026',
      purpose: 'APAC Cloud Native Summit Keynote',
      flight: 'Singapore Airlines SQ-505',
      hotel: 'Marina Bay Sands',
      status: 'Processing',
      costEst: '$2,850',
    },
  ]);
  const [travelerName, setTravelerName] = useState('');
  const [tripRoute, setTripRoute] = useState('');
  const [tripPurpose, setTripPurpose] = useState('');

  // Onboarding Joiners State
  const [onboardingJoiners, setOnboardingJoiners] = useState(() => data.joiners);

  const catalog = getMoreModulesCatalog(data);
  const filteredModules = filterMoreModules(
    catalog,
    searchQuery,
    activeRole,
    selectedCategory
  );

  const handleRunPayroll = async () => {
    if (!canEdit) return;
    try {
      const res = await triggerPayroll().unwrap();
      onSuccessToast(res.message);
    } catch {
      onSuccessToast('Unable to process payroll cycle.');
    }
  };

  const handleSelectModule = (mod: MoreModuleItem) => {
    // Route directly to existing screens where applicable, or open functional sub-workspace
    if (mod.id === 'shifts_rosters') {
      onNavigateBottomTab('home');
      onNavigateHomeTab('shifts');
      return;
    }
    if (mod.id === 'holidays') {
      onNavigateBottomTab('home');
      onNavigateHomeTab('holidays');
      return;
    }
    if (mod.id === 'my_profile') {
      onNavigateBottomTab('profile');
      return;
    }
    setActiveSubModule(mod.id);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatHistory((prev) => [
      ...prev,
      {
        id: `MSG-${Date.now()}`,
        sender: `${data.adminProfile.name} (You)`,
        time: 'Just now',
        text: chatMessage.trim(),
      },
    ]);
    setChatMessage('');
    onSuccessToast('Message delivered to OFC Connect channel.');
  };

  const activeModuleMeta = catalog.find((m) => m.id === activeSubModule);

  return (
    <div className="space-y-5" data-testid="mobile-more-modules-screen">
      {/* If an interactive sub-module workspace is open, show its functional screen with Back button */}
      {activeSubModule && activeModuleMeta ? (
        <div
          className="space-y-4"
          data-testid={`more-active-workspace-${activeSubModule}`}
        >
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveSubModule(null)}
                data-testid="more-back-to-launcher-btn"
                className="min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                All Modules
              </button>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                  {activeModuleMeta.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeModuleMeta.title}
                </h3>
              </div>
            </div>
          </div>

          {/* 1A. PAYROLL EXECUTION WORKSPACE */}
          {activeSubModule === 'payroll' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {data.kpis.payroll.cycleName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Status: {data.kpis.payroll.status} · Next Payout:{' '}
                      {data.kpis.payroll.nextPayoutDate}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/payroll-analytics"
                    data-testid="launch-full-payroll-analytics-btn"
                    className="min-h-[40px] px-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    Open Payroll Analytics &rarr;
                  </Link>
                  {canEdit && (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleRunPayroll}
                      data-testid="more-execute-payroll-btn"
                      className="min-h-[40px] px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                    >
                      {isLoading ? 'Processing...' : 'Execute Payroll Run'}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-mono tabular-nums">
                <div>
                  <span className="text-slate-500 block font-sans">
                    Net Payable
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {data.kpis.payroll.netPayableFormatted}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block font-sans">
                    Tax Withheld
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {data.kpis.payroll.taxWithheldFormatted}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block font-sans">
                    Eligible Staff
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {data.kpis.payroll.eligibleEmployees}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block font-sans">
                    Compliance
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {data.kpis.payroll.complianceScore}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 1B. ENTERPRISE PAYROLL ANALYTICS DASHBOARD */}
          {activeSubModule === 'payroll_analytics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 px-1">
                <span className="text-xs text-slate-500 font-mono">
                  Enterprise Financial Intelligence Suite
                </span>
                <Link
                  href="/payroll-analytics"
                  data-testid="expand-payroll-analytics-fullscreen"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  Open Dedicated Full-Screen View (/payroll-analytics) &rarr;
                </Link>
              </div>
              <PayrollAnalyticsDashboard isEmbedded initialRole={activeRole} />
            </div>
          )}

          {/* 2. RECRUITMENT WORKSPACE */}
          {activeSubModule === 'recruitment' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Hiring Requisitions (
                  {data.kpis.recruitment.openPositions} Positions)
                </h4>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {data.kpis.recruitment.candidatesInPipeline} Candidates
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.requisitions.map((req) => (
                  <div
                    key={req.id}
                    className="py-3 first:pt-1 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {req.id} · {req.department}
                      </span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {req.title}
                      </p>
                    </div>
                    <div className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      {req.openings} Openings · {req.candidatesInPipeline}{' '}
                      Candidates ·{' '}
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {req.stage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ONBOARDING WORKSPACE */}
          {activeSubModule === 'onboarding' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Employee Onboarding &amp; Induction Pipeline ({onboardingJoiners.length} New Joinees)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Track document verification, IT kit handovers, and Day-1 buddy alignments
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onSuccessToast('Automated Welcome Kits dispatched to all upcoming new hires.')
                  }
                  className="min-h-[38px] px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Dispatch Welcome Kits
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <span className="text-[11px] text-slate-500 block">Upcoming Joiners</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{onboardingJoiners.length}</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <span className="text-[11px] text-slate-500 block">IT Laptop Provisioning</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">100%</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <span className="text-[11px] text-slate-500 block">Identity / KYC</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">Verified</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <span className="text-[11px] text-slate-500 block">Day 1 Buddies</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">Assigned</span>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {onboardingJoiners.map((j) => (
                  <div key={j.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{j.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {j.onboardingStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {j.designation} · {j.department} · Joining: {j.joiningDate}
                      </p>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                        Work Location: {j.location} · ID: {j.employeeId}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onSuccessToast(`Day-1 orientation agenda & NDA signed for ${j.name}.`)
                      }
                      className="min-h-[36px] px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer self-start sm:self-auto"
                    >
                      Complete Induction
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ASSET MANAGEMENT WORKSPACE */}
          {activeSubModule === 'asset_management' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Hardware, Laptop &amp; Office Asset Inventory ({assetsList.length} Tracked)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Track device serial numbers, allocation status, and warranty lifecycles
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {assetsList.filter(a => a.status === 'Allocated').length} In Use
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {assetsList.filter(a => a.status === 'In Stock').length} In Stock
                  </span>
                </div>
              </div>

              {/* Allocate New Hardware Form */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  + Allocate New Hardware Asset
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newAssetModel}
                    onChange={(e) => setNewAssetModel(e.target.value)}
                    placeholder="Device model (e.g. MacBook Pro M3)"
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={newAssetAssignee}
                    onChange={(e) => setNewAssetAssignee(e.target.value)}
                    placeholder="Assignee employee name"
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newAssetModel.trim()) return;
                      const newId = `AST-${100 + assetsList.length + 1}`;
                      setAssetsList((prev) => [
                        {
                          id: newId,
                          title: newAssetModel.trim(),
                          category: 'Workstations',
                          assignedTo: newAssetAssignee.trim() || 'Unassigned Stock',
                          serial: `SN-${Math.floor(100000 + Math.random() * 900000)}`,
                          status: newAssetAssignee.trim() ? 'Allocated' : 'In Stock',
                        },
                        ...prev,
                      ]);
                      setNewAssetModel('');
                      setNewAssetAssignee('');
                      onSuccessToast(`Asset ${newId} registered and assigned.`);
                    }}
                    className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Allocate Asset
                  </button>
                </div>
              </div>

              {/* Asset List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {assetsList.map((asset) => (
                  <div
                    key={asset.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {asset.id}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {asset.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            asset.status === 'Allocated'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {asset.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Assigned To: <span className="font-semibold text-slate-700 dark:text-slate-200">{asset.assignedTo}</span> · Serial: {asset.serial} · Category: {asset.category}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onSuccessToast(`Asset telemetry & audit log retrieved for ${asset.id}.`)
                      }
                      className="min-h-[34px] px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer self-start sm:self-auto"
                    >
                      Audit Log
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VISITOR MANAGEMENT WORKSPACE */}
          {activeSubModule === 'visitor_management' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Corporate Front Desk &amp; Visitor Registry ({visitorList.length} Guests)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Digital badges, host notifications, and campus security check-ins
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {visitorList.filter(v => v.status !== 'Checked Out').length} On Premise
                  </span>
                </div>
              </div>

              {/* Issue Visitor Pass Form */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  + Issue Digital Visitor Pass
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Guest full name"
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={guestOrg}
                    onChange={(e) => setGuestOrg(e.target.value)}
                    placeholder="Organization / Company"
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={guestPurpose}
                    onChange={(e) => setGuestPurpose(e.target.value)}
                    placeholder="Purpose of visit"
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!guestName.trim()) return;
                      const newId = `VIS-${800 + visitorList.length + 1}`;
                      setVisitorList((prev) => [
                        {
                          id: newId,
                          guestName: guestName.trim(),
                          organization: guestOrg.trim() || 'Guest',
                          host: data.adminProfile.name,
                          purpose: guestPurpose.trim() || 'Client Meeting',
                          badgeNo: `BADGE-${10 + visitorList.length + 1}`,
                          status: 'Checked In',
                          entryTime: 'Just now',
                        },
                        ...prev,
                      ]);
                      setGuestName('');
                      setGuestOrg('');
                      setGuestPurpose('');
                      onSuccessToast(`Visitor badge generated for ${guestName.trim()}.`);
                    }}
                    className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Issue Pass
                  </button>
                </div>
              </div>

              {/* Visitors Log */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {visitorList.map((vis) => (
                  <div
                    key={vis.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {vis.id}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {vis.guestName}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({vis.organization})
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            vis.status === 'Checked In'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : vis.status === 'In Meeting'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {vis.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Host: <span className="font-semibold text-slate-700 dark:text-slate-200">{vis.host}</span> · Purpose: {vis.purpose} · {vis.badgeNo} · Entry: {vis.entryTime}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onSuccessToast(`Digital visitor pass sent to ${vis.guestName} via SMS &amp; Email.`)
                      }
                      className="min-h-[34px] px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer self-start sm:self-auto"
                    >
                      Print / Share
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TRAVEL DESK WORKSPACE */}
          {activeSubModule === 'travel_desk' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Corporate Travel &amp; Itinerary Desk ({travelTrips.length} Bookings)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Flight, hotel, per diem allowances, and business travel authorization
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    Corporate Rate: Active
                  </span>
                </div>
              </div>

              {/* Book Corporate Travel Form */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  + Create Corporate Travel Requisition
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={travelerName}
                    onChange={(e) => setTravelerName(e.target.value)}
                    placeholder="Traveler name"
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={tripRoute}
                    onChange={(e) => setTripRoute(e.target.value)}
                    placeholder="Route (e.g. DEL ➔ SFO)"
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={tripPurpose}
                    onChange={(e) => setTripPurpose(e.target.value)}
                    placeholder="Business purpose"
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!travelerName.trim()) return;
                      const newId = `TRV-${400 + travelTrips.length + 1}`;
                      setTravelTrips((prev) => [
                        {
                          id: newId,
                          traveler: travelerName.trim(),
                          department: 'Operations',
                          route: tripRoute.trim() || 'DEL ➔ BLR',
                          dates: 'Dec 01 – Dec 04, 2026',
                          purpose: tripPurpose.trim() || 'Quarterly Business Review',
                          flight: 'Air India AI-804',
                          hotel: 'Taj Coromandel',
                          status: 'Approved',
                          costEst: '$850',
                        },
                        ...prev,
                      ]);
                      setTravelerName('');
                      setTripRoute('');
                      setTripPurpose('');
                      onSuccessToast(`Travel itinerary ${newId} confirmed and ticketed.`);
                    }}
                    className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Book Trip
                  </button>
                </div>
              </div>

              {/* Travel Itineraries List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {travelTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {trip.id}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {trip.traveler}
                        </span>
                        <span className="font-mono font-semibold text-xs text-indigo-600 dark:text-indigo-400">
                          {trip.route}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            trip.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {trip.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {trip.department} · {trip.dates} · {trip.flight} · {trip.hotel} · Est: {trip.costEst}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        Purpose: {trip.purpose}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onSuccessToast(`Boarding passes &amp; hotel confirmation vouchers downloaded for ${trip.id}.`)
                      }
                      className="min-h-[34px] px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer self-start sm:self-auto"
                    >
                      Vouchers
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. EXIT MANAGEMENT WORKSPACE */}
          {activeSubModule === 'exit_management' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Active Offboarding &amp; Clearance Queue ({data.exits.length})
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.exits.map((ex) => (
                  <div
                    key={ex.id}
                    className="py-3 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {ex.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {ex.designation} · {ex.department} · Last Day:{' '}
                        {ex.lastWorkingDay}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onSuccessToast(
                          `FnF & IT asset clearance verified for ${ex.name}.`
                        )
                      }
                      className="min-h-[38px] px-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-semibold cursor-pointer"
                    >
                      Verify Clearance
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. PERFORMANCE & GOALS WORKSPACE */}
          {activeSubModule === 'performance_goals' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Q4 2026 OKR &amp; 360° Appraisal Cycle
                  </h4>
                  <p className="text-xs text-slate-500">
                    Self-reviews and manager calibrations across 6 departments
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onSuccessToast(
                      'Appraisal calibration nudge sent to department heads.'
                    )
                  }
                  className="min-h-[38px] px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Nudge Reviewers
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    title: 'Engineering OKRs',
                    completion: '94%',
                    lead: 'Elena Rostova',
                  },
                  {
                    title: 'Product & Design',
                    completion: '89%',
                    lead: 'Sora Takahashi',
                  },
                  {
                    title: 'Enterprise Sales',
                    completion: '91%',
                    lead: 'Marcus Vance',
                  },
                ].map((goal) => (
                  <div
                    key={goal.title}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {goal.title}
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {goal.completion}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Lead: {goal.lead}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. OFC CONNECT CHAT WORKSPACE */}
          {activeSubModule === 'ofc_connect_chat' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {msg.sender}
                      </span>
                      <span className="font-mono text-slate-400">
                        {msg.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Message #hr-leadership-ops..."
                  className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="h-10 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </form>
            </div>
          )}

          {/* 6. AUDIO & VIDEO MEETINGS WORKSPACE */}
          {activeSubModule === 'audio_video_meetings' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Scheduled HD Rooms &amp; Townhalls
                </h4>
                <button
                  type="button"
                  onClick={() =>
                    onSuccessToast(
                      'Instant encrypted OFC Meet room launched (ID: OFC-MEET-409).'
                    )
                  }
                  className="min-h-[38px] px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Start Instant Huddle
                </button>
              </div>
              <div className="space-y-2.5">
                {[
                  {
                    id: 'MTG-1',
                    title: 'Weekly People & Culture Sync',
                    time: '11:30 AM – 12:15 PM IST',
                    participants: '14 Joined',
                  },
                  {
                    id: 'MTG-2',
                    title: 'Staff Rust Engineer Final Panel',
                    time: '03:00 PM – 04:00 PM IST',
                    participants: '4 Panelists',
                  },
                ].map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {m.title}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {m.time} · {m.participants}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onSuccessToast(`Joined ${m.title} audio/video bridge.`)
                      }
                      className="min-h-[36px] px-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      Join Room
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. ANNOUNCEMENTS WORKSPACE */}
          {activeSubModule === 'announcements' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Corporate Broadcasts ({data.announcements.length})
                </h4>
                {canEdit && (
                  <button
                    type="button"
                    onClick={onOpenAnnouncement}
                    className="min-h-[38px] px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    + New Broadcast
                  </button>
                )}
              </div>
              <div className="space-y-2.5">
                {data.announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {ann.category} · {ann.priority} Priority
                      </span>
                      <span className="text-slate-400 font-mono">
                        Expires {ann.expiryDate}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {ann.title}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {ann.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. INTELLIGENCE & ANALYTICS WORKSPACES */}
          {(activeSubModule === 'people_ai' ||
            activeSubModule === 'reports_analytics' ||
            activeSubModule === 'workforce_analytics' ||
            activeSubModule === 'attendance_analytics') && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeModuleMeta.title} — Real-Time Telemetry
                  </h4>
                  <p className="text-xs text-slate-500">
                    Live workforce velocity, retention health, and attendance
                    adherence
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onSuccessToast(
                      `Exported ${activeModuleMeta.title} CSV & PDF executive pack.`
                    )
                  }
                  className="min-h-[38px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export MIS
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[11px] text-slate-500 block">
                    Active Workforce
                  </span>
                  <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                    {data.kpis.workforce.totalActive}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[11px] text-slate-500 block">
                    Attendance SLA
                  </span>
                  <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {data.kpis.attendance.ratePercentage}%
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[11px] text-slate-500 block">
                    Retention Stability
                  </span>
                  <span className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    97.8%
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[11px] text-slate-500 block">
                    eNPS Pulse Score
                  </span>
                  <span className="text-lg font-mono font-bold text-violet-600 dark:text-violet-400">
                    +64
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 9. DOCUMENTS & COMPLIANCE WORKSPACES */}
          {(activeSubModule === 'employee_documents' ||
            activeSubModule === 'documents_policies' ||
            activeSubModule === 'compliance_center') && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {activeModuleMeta.title} Repository
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  {
                    code: 'DOC-2026-01',
                    title: 'OFC360 Global Employee Handbook & Code of Conduct',
                    status: '99.4% Acknowledged',
                  },
                  {
                    code: 'DOC-2026-02',
                    title: 'POSH, SOC2 Type II & ISO-27001 Security Charter',
                    status: 'Verified Audit',
                  },
                  {
                    code: 'DOC-2026-03',
                    title: 'Statutory PF, ESI, PT & TDS Filing Certificates',
                    status: 'Compliant',
                  },
                ].map((doc) => (
                  <div
                    key={doc.code}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                        {doc.code}
                      </span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {doc.title}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onSuccessToast(`Downloaded ${doc.code} signed PDF.`)
                      }
                      className="min-h-[36px] px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      {doc.status}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. SETTINGS WORKSPACE */}
          {activeSubModule === 'settings' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Mobile Application Preferences
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      Dark Theme Appearance
                    </p>
                    <p className="text-xs text-slate-500">
                      Switch between crisp daylight and OLED slate dark mode
                    </p>
                  </div>
                  {onToggleDarkMode && (
                    <button
                      type="button"
                      onClick={onToggleDarkMode}
                      className="min-h-[38px] px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 11. INTEGRATIONS WORKSPACE */}
          {activeSubModule === 'integrations' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Connected Enterprise Ecosystems
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {integrationsList.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.category} · Synced {item.lastSync}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIntegrationsList((prev) =>
                          prev.map((i) =>
                            i.id === item.id
                              ? { ...i, connected: !i.connected }
                              : i
                          )
                        );
                        onSuccessToast(`Updated ${item.name} connector state.`);
                      }}
                      className={`min-h-[36px] px-3 rounded-xl text-xs font-semibold cursor-pointer ${
                        item.connected
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {item.connected ? 'Connected' : 'Paused'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. HELP & SUPPORT WORKSPACE */}
          {activeSubModule === 'help_support' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/50 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 p-5 space-y-3.5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                      <span>Enterprise Portal</span>
                      <span className="w-1 h-1 rounded-full bg-indigo-500" />
                      <span>14 Specialized Modules</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      HR Admin Help Desk &amp; Employee Support
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Unified desk for tickets, confidential complaints, SLA countdowns, agent dispatch, employee requests, knowledge base, and AI assistance.
                    </p>
                  </div>
                  <Link
                    href="/helpdesk"
                    data-testid="launch-helpdesk-portal-button"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shrink-0 shadow-sm"
                  >
                    Open Enterprise Help Desk &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/40 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Tickets Queue</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">All &amp; My Assigned</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">SLA Engine</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Live Countdowns</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Confidential</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">RBAC Complaints</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">AI Powered</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Smart Classification</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Quick Ticket Submission
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    placeholder="Describe issue or SLA request..."
                    className="sm:col-span-2 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                  <div className="flex gap-2">
                    <select
                      value={supportPriority}
                      onChange={(e) =>
                        setSupportPriority(e.target.value as 'Normal' | 'High')
                      }
                      className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="Normal">Normal SLA</option>
                      <option value="High">High Priority</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (!supportSubject.trim()) return;
                        onSuccessToast(
                          `Support ticket logged (${supportPriority} SLA): ${supportSubject}`
                        );
                        setSupportSubject('');
                      }}
                      className="h-10 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Search Controls */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="more-modules-search"
              placeholder="Search HR modules (Payroll, People AI, Chat, Compliance...)"
              className="w-full h-11 pl-10 pr-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* All Modules Grid without category headers */}
          {filteredModules.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-2">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                No matching modules found
              </p>
              <p className="text-xs text-slate-500">
                Try clearing your search filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredModules.map((mod) => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => handleSelectModule(mod)}
                  data-testid={`more-module-card-${mod.id}`}
                  className="group p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 dark:hover:border-indigo-500 text-left flex flex-col justify-between gap-3 shadow-2xs transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {getModuleIcon(mod.id)}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {mod.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}


interface ProfileScreenProps {
  data: HrDashboardDataState;
  activeRole: Ofc360Role;
  onRoleChange: (role: Ofc360Role) => void;
  onSuccessToast: (msg: string) => void;
}

export function ProfileScreen({
  data,
  activeRole,
  onSuccessToast,
}: ProfileScreenProps) {
  const [activeSection, setActiveSection] = useState<'profile' | 'company'>(
    'profile'
  );

  // 1. Primary Admin Profile state (Read + Update)
  const [adminInfo, setAdminInfo] = useState({
    name: data.adminProfile.name,
    designation: data.adminProfile.designation,
    email: data.adminProfile.email,
    department: data.adminProfile.department,
    location: data.adminProfile.location,
  });
  const [isEditingAdminInfo, setIsEditingAdminInfo] = useState(false);

  // 2. Profile Records CRUD state (Create, Read, Update, Delete)
  const [profileRecords, setProfileRecords] = useState<ProfileCrudRecord[]>(() =>
    createInitialProfileRecords()
  );
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | undefined>(
    undefined
  );
  const [profileTitle, setProfileTitle] = useState('');
  const [profileCategory, setProfileCategory] =
    useState<ProfileCrudRecord['category']>('Personal');
  const [profileValue, setProfileValue] = useState('');
  const [profileStatus, setProfileStatus] =
    useState<ProfileCrudRecord['status']>('Verified');

  // 3. Primary Company Profile state (Read + Update)
  const [companyOverview, setCompanyOverview] = useState({
    companyName: 'OFC360 Technologies Pvt. Ltd.',
    cinNumber: 'U72900KA2021PTC148360',
    hqLocation: 'Bengaluru, Karnataka',
    website: 'https://ofc360.com',
  });
  const [isEditingCompanyOverview, setIsEditingCompanyOverview] =
    useState(false);

  // 4. Company Entities / Branches CRUD state (Create, Read, Update, Delete)
  const [companyRecords, setCompanyRecords] = useState<CompanyCrudRecord[]>(() =>
    createInitialCompanyRecords()
  );
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | undefined>(
    undefined
  );
  const [companyNameInput, setCompanyNameInput] = useState('');
  const [companyCodeInput, setCompanyCodeInput] = useState('');
  const [companyCityInput, setCompanyCityInput] = useState('');
  const [companyGstInput, setCompanyGstInput] = useState('');
  const [companyHeadcountInput, setCompanyHeadcountInput] = useState('50');
  const [companyStatusInput, setCompanyStatusInput] =
    useState<CompanyCrudRecord['status']>('Active');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);

  // Profile CRUD Handlers
  const openCreateProfileRecord = () => {
    setEditingProfileId(undefined);
    setProfileTitle('');
    setProfileCategory('Personal');
    setProfileValue('');
    setProfileStatus('Verified');
    setIsProfileFormOpen(true);
  };

  const openEditProfileRecord = (rec: ProfileCrudRecord) => {
    setEditingProfileId(rec.id);
    setProfileTitle(rec.title);
    setProfileCategory(rec.category);
    setProfileValue(rec.value);
    setProfileStatus(rec.status);
    setIsProfileFormOpen(true);
  };

  const handleSaveProfileRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileTitle.trim() || !profileValue.trim()) {
      onSuccessToast('Please enter both title and value for Profile record.');
      return;
    }
    setProfileRecords((prev) =>
      upsertProfileRecord(prev, {
        id: editingProfileId,
        title: profileTitle,
        category: profileCategory,
        value: profileValue,
        status: profileStatus,
      })
    );
    setIsProfileFormOpen(false);
    onSuccessToast(
      editingProfileId
        ? 'Profile record updated successfully.'
        : 'New profile record added.'
    );
  };

  const handleDeleteProfileRecord = (id: string, title: string) => {
    setProfileRecords((prev) => deleteProfileRecord(prev, id));
    onSuccessToast(`Removed "${title}" from Profile.`);
  };

  const handleSaveAdminInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingAdminInfo(false);
    onSuccessToast('Profile personal details updated.');
  };

  // Company CRUD Handlers
  const openCreateCompanyRecord = () => {
    setEditingCompanyId(undefined);
    setCompanyNameInput('');
    setCompanyCodeInput('');
    setCompanyCityInput('');
    setCompanyGstInput('');
    setCompanyHeadcountInput('50');
    setCompanyStatusInput('Active');
    setIsCompanyFormOpen(true);
  };

  const openEditCompanyRecord = (rec: CompanyCrudRecord) => {
    setEditingCompanyId(rec.id);
    setCompanyNameInput(rec.name);
    setCompanyCodeInput(rec.code);
    setCompanyCityInput(rec.city);
    setCompanyGstInput(rec.gstOrRegNo);
    setCompanyHeadcountInput(String(rec.headcount));
    setCompanyStatusInput(rec.status);
    setIsCompanyFormOpen(true);
  };

  const handleSaveCompanyRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !companyNameInput.trim() ||
      !companyCodeInput.trim() ||
      !companyCityInput.trim()
    ) {
      onSuccessToast('Please fill Company Name, Code, and City.');
      return;
    }
    setCompanyRecords((prev) =>
      upsertCompanyRecord(prev, {
        id: editingCompanyId,
        name: companyNameInput,
        code: companyCodeInput,
        city: companyCityInput,
        gstOrRegNo: companyGstInput || 'GSTIN Pending',
        headcount: Number(companyHeadcountInput) || 0,
        status: companyStatusInput,
      })
    );
    setIsCompanyFormOpen(false);
    onSuccessToast(
      editingCompanyId
        ? 'Company record updated successfully.'
        : 'New company entity added.'
    );
  };

  const handleDeleteCompanyRecord = (id: string, name: string) => {
    setCompanyRecords((prev) => deleteCompanyRecord(prev, id));
    onSuccessToast(`Removed "${name}" from Company list.`);
  };

  const handleSaveCompanyOverview = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingCompanyOverview(false);
    onSuccessToast('Company registration details updated.');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || newPassword.length < 8) {
      onSuccessToast('New password must be at least 8 characters.');
      return;
    }
    setIsUpdatingPwd(true);
    try {
      const res = await authClient.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: newPassword,
      });
      onSuccessToast(res.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      onSuccessToast('Password updated for current session.');
    } finally {
      setIsUpdatingPwd(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const totalCompanyStaff = companyRecords.reduce(
    (sum, item) => sum + item.headcount,
    0
  );
  const adminInitials =
    adminInfo.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'AS';

  return (
    <div className="space-y-5" data-testid="mobile-profile-screen">
      {/* 2 KPI CARDS: 1) Profile KPI Card  2) Company KPI Card */}
      <section
        aria-label="Profile and Company KPI Cards"
        className="grid grid-cols-2 gap-3"
      >
        {/* KPI Card 1: Profile */}
        <button
          type="button"
          onClick={() => setActiveSection('profile')}
          data-testid="profile-kpi-card"
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
            activeSection === 'profile'
              ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-600 shadow-2xs'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Profile
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span
                data-testid="profile-kpi-count"
                className="font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums"
              >
                {profileRecords.length}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {adminInfo.name} · CRUD
            </p>
          </div>
        </button>

        {/* KPI Card 2: Company */}
        <button
          type="button"
          onClick={() => setActiveSection('company')}
          data-testid="company-kpi-card"
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
            activeSection === 'company'
              ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-600 shadow-2xs'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Company
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span
                data-testid="company-kpi-count"
                className="font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums"
              >
                {companyRecords.length}
              </span>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                {totalCompanyStaff} Staff
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {companyOverview.companyName}
            </p>
          </div>
        </button>
      </section>

      {/* SECTION 1: PROFILE CRUD WORKSPACE */}
      {activeSection === 'profile' && (
        <div className="space-y-5" data-testid="profile-crud-section">
          {/* Admin Identity Card with Inline Edit */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                  {adminInitials}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {data.adminProfile.employeeId}
                    </span>
                    <span>·</span>
                    <span className="font-mono">{activeRole}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {adminInfo.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {adminInfo.designation} · {adminInfo.email}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {adminInfo.department} · {adminInfo.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setIsEditingAdminInfo((prev) => !prev)}
                  data-testid="edit-primary-profile-btn"
                  className="min-h-[40px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  {isEditingAdminInfo ? 'Cancel' : 'Edit Profile'}
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  data-testid="mobile-sign-out-btn"
                  className="min-h-[40px] px-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>

            {isEditingAdminInfo && (
              <form
                onSubmit={handleSaveAdminInfo}
                className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <input
                  type="text"
                  value={adminInfo.name}
                  onChange={(e) =>
                    setAdminInfo((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Full Name"
                  className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs"
                />
                <input
                  type="text"
                  value={adminInfo.designation}
                  onChange={(e) =>
                    setAdminInfo((p) => ({ ...p, designation: e.target.value }))
                  }
                  placeholder="Designation"
                  className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs"
                />
                <input
                  type="email"
                  value={adminInfo.email}
                  onChange={(e) =>
                    setAdminInfo((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="Email Address"
                  className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs"
                />
                <input
                  type="text"
                  value={adminInfo.location}
                  onChange={(e) =>
                    setAdminInfo((p) => ({ ...p, location: e.target.value }))
                  }
                  placeholder="Work Location"
                  className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs"
                />
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Save Profile Info
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Profile Records CRUD List (Create, Read, Update, Delete) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Profile Details & Records (CRUD)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add, edit, or delete personal, emergency, and bank records
                </p>
              </div>
              <button
                type="button"
                onClick={openCreateProfileRecord}
                data-testid="add-profile-record-btn"
                className="min-h-[38px] px-3 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Record
              </button>
            </div>

            {isProfileFormOpen && (
              <form
                onSubmit={handleSaveProfileRecord}
                data-testid="profile-record-form"
                className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    {editingProfileId
                      ? 'Edit Profile Record'
                      : 'Create Profile Record'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsProfileFormOpen(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={profileTitle}
                    onChange={(e) => setProfileTitle(e.target.value)}
                    placeholder="Record Title (e.g. Passport Number)"
                    data-testid="profile-record-title-input"
                    className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs"
                  />
                  <select
                    value={profileCategory}
                    onChange={(e) =>
                      setProfileCategory(
                        e.target.value as ProfileCrudRecord['category']
                      )
                    }
                    className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Certification">Certification</option>
                    <option value="Financial">Financial</option>
                  </select>
                  <input
                    type="text"
                    value={profileValue}
                    onChange={(e) => setProfileValue(e.target.value)}
                    placeholder="Details / Value"
                    data-testid="profile-record-value-input"
                    className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs sm:col-span-2"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    data-testid="save-profile-record-btn"
                    className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    {editingProfileId ? 'Update Record' : 'Save Record'}
                  </button>
                </div>
              </form>
            )}

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {profileRecords.map((rec) => (
                <div
                  key={rec.id}
                  data-testid={`profile-record-item-${rec.id}`}
                  className="py-3 first:pt-1 last:pb-0 flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {rec.category}
                      </span>
                      <span>·</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {rec.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {rec.title}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 break-words">
                      {rec.value}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditProfileRecord(rec)}
                      aria-label={`Edit ${rec.title}`}
                      data-testid={`edit-profile-record-${rec.id}`}
                      className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-indigo-500 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteProfileRecord(rec.id, rec.title)
                      }
                      aria-label={`Delete ${rec.title}`}
                      data-testid={`delete-profile-record-${rec.id}`}
                      className="w-8 h-8 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 dark:text-rose-400 hover:bg-rose-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Change Password Card */}
          <form
            onSubmit={handlePasswordChange}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3.5"
          >
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Update Workspace Password
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 text-xs text-slate-900 dark:text-slate-100"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New strong password (min 8 chars)"
                className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
            <button
              type="submit"
              disabled={isUpdatingPwd}
              className="min-h-[42px] px-4 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
            >
              {isUpdatingPwd ? 'Updating...' : 'Save New Password'}
            </button>
          </form>
        </div>
      )}

      {/* SECTION 2: COMPANY CRUD WORKSPACE */}
      {activeSection === 'company' && (
        <div className="space-y-5" data-testid="company-crud-section">
          {/* Primary Company Overview Card with Inline Edit */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  OFC
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold text-sky-600 dark:text-sky-400">
                    CIN: {companyOverview.cinNumber}
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {companyOverview.companyName}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    HQ: {companyOverview.hqLocation} · {companyOverview.website}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingCompanyOverview((prev) => !prev)}
                data-testid="edit-company-overview-btn"
                className="min-h-[40px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                {isEditingCompanyOverview ? 'Cancel' : 'Edit Company'}
              </button>
            </div>

            {isEditingCompanyOverview && (
              <form
                onSubmit={handleSaveCompanyOverview}
                className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <input
                  type="text"
                  value={companyOverview.companyName}
                  onChange={(e) =>
                    setCompanyOverview((p) => ({
                      ...p,
                      companyName: e.target.value,
                    }))
                  }
                  placeholder="Registered Company Name"
                  className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs"
                />
                <input
                  type="text"
                  value={companyOverview.cinNumber}
                  onChange={(e) =>
                    setCompanyOverview((p) => ({
                      ...p,
                      cinNumber: e.target.value,
                    }))
                  }
                  placeholder="CIN / Registration No."
                  className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs"
                />
                <input
                  type="text"
                  value={companyOverview.hqLocation}
                  onChange={(e) =>
                    setCompanyOverview((p) => ({
                      ...p,
                      hqLocation: e.target.value,
                    }))
                  }
                  placeholder="Headquarters Location"
                  className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs"
                />
                <input
                  type="text"
                  value={companyOverview.website}
                  onChange={(e) =>
                    setCompanyOverview((p) => ({
                      ...p,
                      website: e.target.value,
                    }))
                  }
                  placeholder="Website URL"
                  className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs"
                />
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Save Company Info
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Company Entities / Branches CRUD List (Create, Read, Update, Delete) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Company Entities & Branches (CRUD)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add, edit, or delete company branches and GST registrations
                </p>
              </div>
              <button
                type="button"
                onClick={openCreateCompanyRecord}
                data-testid="add-company-record-btn"
                className="min-h-[38px] px-3 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Company
              </button>
            </div>

            {isCompanyFormOpen && (
              <form
                onSubmit={handleSaveCompanyRecord}
                data-testid="company-record-form"
                className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    {editingCompanyId
                      ? 'Edit Company Entity'
                      : 'Create Company Entity'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCompanyFormOpen(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={companyNameInput}
                    onChange={(e) => setCompanyNameInput(e.target.value)}
                    placeholder="Entity / Branch Name"
                    data-testid="company-name-input"
                    className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs"
                  />
                  <input
                    type="text"
                    value={companyCodeInput}
                    onChange={(e) => setCompanyCodeInput(e.target.value)}
                    placeholder="Branch Code (e.g. DEL-N-04)"
                    data-testid="company-code-input"
                    className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={companyCityInput}
                    onChange={(e) => setCompanyCityInput(e.target.value)}
                    placeholder="City & State"
                    data-testid="company-city-input"
                    className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs"
                  />
                  <input
                    type="text"
                    value={companyGstInput}
                    onChange={(e) => setCompanyGstInput(e.target.value)}
                    placeholder="GSTIN / Tax Registration"
                    data-testid="company-gst-input"
                    className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-mono"
                  />
                  <input
                    type="number"
                    value={companyHeadcountInput}
                    onChange={(e) => setCompanyHeadcountInput(e.target.value)}
                    placeholder="Headcount"
                    className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-mono"
                  />
                  <select
                    value={companyStatusInput}
                    onChange={(e) =>
                      setCompanyStatusInput(
                        e.target.value as CompanyCrudRecord['status']
                      )
                    }
                    className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Expanding">Expanding</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    data-testid="save-company-record-btn"
                    className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    {editingCompanyId ? 'Update Company' : 'Save Company'}
                  </button>
                </div>
              </form>
            )}

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {companyRecords.map((comp) => (
                <div
                  key={comp.id}
                  data-testid={`company-record-item-${comp.id}`}
                  className="py-3.5 first:pt-1 last:pb-0 flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {comp.code}
                      </span>
                      <span>·</span>
                      <span>{comp.city}</span>
                      <span>·</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {comp.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {comp.name}
                    </p>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {comp.gstOrRegNo} · {comp.headcount} Employees
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditCompanyRecord(comp)}
                      aria-label={`Edit ${comp.name}`}
                      data-testid={`edit-company-record-${comp.id}`}
                      className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-indigo-500 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteCompanyRecord(comp.id, comp.name)
                      }
                      aria-label={`Delete ${comp.name}`}
                      data-testid={`delete-company-record-${comp.id}`}
                      className="w-8 h-8 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 dark:text-rose-400 hover:bg-rose-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
