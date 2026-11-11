'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useCreateRequisitionMutation,
  useAdvanceRequisitionStageMutation,
  useRecordFaceAttendanceMutation,
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
  Network,
  Users,
  MoreVertical,
  ScanFace,
  Camera,
} from 'lucide-react';
import { OrganizationChartModule } from './organization-chart-module';


interface WorkforceScreenProps {
  data: HrDashboardDataState;
  canEdit: boolean;
  onOpenAddEmployee: () => void;
  onSuccessToast?: (msg: string) => void;
}

type WorkforceSubView = 'directory' | 'departments' | 'org_chart';

export function WorkforceScreen({
  data,
  canEdit,
  onOpenAddEmployee,
  onSuccessToast,
}: WorkforceScreenProps) {
  const [subView, setSubView] = useState<WorkforceSubView>('directory');
  const [isWorkforceMenuOpen, setIsWorkforceMenuOpen] = useState<boolean>(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState<boolean>(false);
  const [isAddDepartmentModalOpen, setIsAddDepartmentModalOpen] = useState<boolean>(false);
  const [newDeptName, setNewDeptName] = useState<string>('');
  const [newDeptHead, setNewDeptHead] = useState<string>('');
  const [customDepartments, setCustomDepartments] = useState<
    { id: string; department: string; headOfDept: string }[]
  >([]);
  const workforceMenuRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [orgFilterDept, setOrgFilterDept] = useState<string>('All');

  useEffect(() => {
    if (!isWorkforceMenuOpen && !isAddMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        workforceMenuRef.current &&
        !workforceMenuRef.current.contains(event.target as Node)
      ) {
        setIsWorkforceMenuOpen(false);
        setIsAddMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsWorkforceMenuOpen(false);
        setIsAddMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isWorkforceMenuOpen, isAddMenuOpen]);

  // Derive active departments strictly from actual enrolled workforce records + user-created departments
  const uniqueWorkforceDeptNames = Array.from(
    new Set([
      ...customDepartments.map((d) => d.department),
      ...data.workforce.map((emp) => emp.department).filter(Boolean),
    ])
  );

  const allDepartments = uniqueWorkforceDeptNames.map((deptName, idx) => {
    const customMatch = customDepartments.find(
      (c) => c.department.toLowerCase() === deptName.toLowerCase()
    );
    const members = data.workforce.filter((emp) => emp.department === deptName);
    const presentCount = members.filter(
      (m) => m.status === 'Present' || m.status === 'Remote'
    ).length;
    const onLeaveCount = members.filter((m) => m.status === 'On Leave').length;
    const lateCount = members.filter((m) => m.status === 'Late').length;
    const absentCount = Math.max(
      0,
      members.length - presentCount - onLeaveCount - lateCount
    );
    const avgAttendance =
      members.length > 0
        ? Number(
            (
              members.reduce((acc, m) => acc + m.attendanceRate, 0) /
              members.length
            ).toFixed(1)
          )
        : 0;

    return {
      id: customMatch?.id || `DEPT-${String(idx + 1).padStart(2, '0')}`,
      department: deptName,
      headOfDept: customMatch?.headOfDept || members[0]?.name || 'Unassigned',
      totalEmployees: members.length,
      presentCount,
      onLeaveCount,
      lateCount,
      absentCount,
      attendancePercentage: avgAttendance,
    };
  });

  const departmentNames = ['All', ...uniqueWorkforceDeptNames];

  const getHeadForDepartment = (deptName: string) => {
    const found = allDepartments.find((d) => d.department === deptName);
    return found ? found.headOfDept : 'Unassigned';
  };

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newDeptName.trim();
    if (!cleanName) return;
    const cleanHead = newDeptHead.trim() || 'Unassigned';
    setCustomDepartments((prev) => {
      const exists = prev.some(
        (d) => d.department.toLowerCase() === cleanName.toLowerCase()
      );
      if (exists) return prev;
      return [
        ...prev,
        {
          id: `DEPT-${String(prev.length + 1).padStart(2, '0')}`,
          department: cleanName,
          headOfDept: cleanHead,
        },
      ];
    });
    setNewDeptName('');
    setNewDeptHead('');
    setIsAddDepartmentModalOpen(false);
    setSubView('departments');
    onSuccessToast?.(`Department "${cleanName}" added.`);
  };

  const q = search.trim().toLowerCase();
  const filteredEmployees = data.workforce.filter((emp) => {
    const matchesDept = dept === 'All' || emp.department === dept;
    const matchesQuery =
      q === '' ||
      emp.name.toLowerCase().includes(q) ||
      emp.employeeId.toLowerCase().includes(q) ||
      emp.designation.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q) ||
      emp.location.toLowerCase().includes(q);
    return matchesDept && matchesQuery;
  });

  const activeSectionLabel =
    subView === 'directory'
      ? 'Employee'
      : subView === 'departments'
      ? 'Department'
      : 'Org Chart';

  return (
    <div className="space-y-5" data-testid="mobile-workforce-screen">
      {/* Top Bar: Active Section Label + (+ Add Dropdown: Add Employee / Add Department) + Three-Dot Menu (Employee / Department / Org Chart) */}
      <div
        ref={workforceMenuRef}
        data-testid="workforce-view-switcher"
        className="relative flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {activeSectionLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsAddMenuOpen((prev) => !prev);
                  setIsWorkforceMenuOpen(false);
                }}
                aria-expanded={isAddMenuOpen}
                aria-label="Open Add menu"
                data-testid="workforce-add-menu-trigger"
                className="min-h-[38px] px-3.5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>

              {/* + ADD DROPDOWN POPUP: Add Employee | Add Department */}
              {isAddMenuOpen && (
                <div
                  data-testid="workforce-add-menu-popup"
                  className="absolute right-0 top-11 z-50 w-52 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl transition-all duration-200 animate-in fade-in zoom-in-95 space-y-1"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddMenuOpen(false);
                      onOpenAddEmployee();
                    }}
                    data-testid="workforce-add-employee-btn"
                    className="w-full min-h-[38px] px-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Add Employee</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddMenuOpen(false);
                      setIsAddDepartmentModalOpen(true);
                    }}
                    data-testid="workforce-add-department-btn"
                    className="w-full min-h-[38px] px-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Add Department</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setIsWorkforceMenuOpen((prev) => !prev);
              setIsAddMenuOpen(false);
            }}
            aria-expanded={isWorkforceMenuOpen}
            aria-label="Toggle Workforce Options menu"
            data-testid="workforce-menu-trigger"
            title="Workforce Options"
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* THREE-DOT DROPDOWN POPUP: Employee | Department | Org Chart */}
        {isWorkforceMenuOpen && (
          <div
            data-testid="workforce-menu-popup"
            className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl transition-all duration-200 animate-in fade-in zoom-in-95 space-y-1"
          >
            <button
              type="button"
              onClick={() => {
                setSubView('directory');
                setIsWorkforceMenuOpen(false);
              }}
              data-testid="workforce-tab-directory"
              className={`w-full min-h-[38px] px-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-left transition-colors cursor-pointer ${
                subView === 'directory'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Employee</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubView('departments');
                setIsWorkforceMenuOpen(false);
              }}
              data-testid="workforce-tab-departments"
              className={`w-full min-h-[38px] px-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-left transition-colors cursor-pointer ${
                subView === 'departments'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Department</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubView('org_chart');
                setIsWorkforceMenuOpen(false);
              }}
              data-testid="workforce-tab-org-chart"
              className={`w-full min-h-[38px] px-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-left transition-colors cursor-pointer ${
                subView === 'org_chart'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Network className="w-4 h-4 shrink-0" />
              <span>Org Chart</span>
            </button>
          </div>
        )}
      </div>

      {/* ADD DEPARTMENT MODAL */}
      {isAddDepartmentModalOpen && (
        <div
          data-testid="add-department-modal"
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Add Department
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDepartmentModalOpen(false)}
                aria-label="Close Add Department Modal"
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="e.g., Engineering, Product & Design, HR"
                  data-testid="add-department-name-input"
                  className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Department Head / Lead
                </label>
                <input
                  type="text"
                  value={newDeptHead}
                  onChange={(e) => setNewDeptHead(e.target.value)}
                  placeholder="e.g., Aarav Sharma"
                  data-testid="add-department-head-input"
                  className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDepartmentModalOpen(false)}
                  className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="submit-add-department-btn"
                  className="h-9 px-4 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 1: EMPLOYEES DIRECTORY
      ===================================================================== */}
      {subView === 'directory' && (
        <>
          {/* Search & Department Filter */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by employee name, ID, role, department, or hub..."
                aria-label="Search workforce directory"
                className="w-full h-11 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            {departmentNames.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {departmentNames.map((d) => (
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
            )}
          </div>

          {/* Employee Cards Grid */}
          {filteredEmployees.length === 0 ? (
            <div
              data-testid="workforce-directory-empty-state"
              className="py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-center space-y-3"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  No data available
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                  {q || dept !== 'All'
                    ? 'No workforce records match your active search or department filter.'
                    : 'No employees have been enrolled in the workforce directory yet. Click + Add to enroll real personnel records.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredEmployees.map((emp) => {
                const managerName = getHeadForDepartment(emp.department);
                return (
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

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 truncate">
                        Dept Head:{' '}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {managerName}
                        </strong>
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSubView('departments');
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                        >
                          Dept
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOrgFilterDept(emp.department);
                            setSubView('org_chart');
                          }}
                          className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Network className="w-3 h-3" />
                          Org Chart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* =====================================================================
          TAB 2: DEPARTMENTS DIRECTORY
      ===================================================================== */}
      {subView === 'departments' && (
        <div className="space-y-4" data-testid="workforce-departments-view">
          {allDepartments.length === 0 ? (
            <div
              data-testid="workforce-departments-empty-state"
              className="py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-center space-y-3"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  No data available
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                  No department records are available yet. Use the + Add button above to add a department or employee.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allDepartments.map((d) => {
                const deptMembers = data.workforce.filter(
                  (emp) => emp.department === d.department
                );

                return (
                  <div
                    key={d.id}
                    data-testid={`department-card-${d.id}`}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                            <span>{d.id}</span>
                            <span>·</span>
                            <span>{d.totalEmployees} Active Personnel</span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {d.department}
                          </h3>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold">
                        {d.attendancePercentage}% Att
                      </span>
                    </div>

                    {/* Department Head row */}
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 px-3 py-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 block">
                          Department Head / Lead
                        </span>
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {d.headOfDept}
                        </p>
                      </div>
                    </div>

                    {/* Headcount & Attendance Metrics Strip */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-950/40 p-2">
                        <span className="text-[10px] text-slate-400 block">Total</span>
                        <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                          {d.totalEmployees}
                        </span>
                      </div>
                      <div className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 p-2">
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">
                          Present
                        </span>
                        <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-300">
                          {d.presentCount}
                        </span>
                      </div>
                      <div className="rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 p-2">
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block">
                          On Leave
                        </span>
                        <span className="text-xs font-bold font-mono text-indigo-700 dark:text-indigo-300">
                          {d.onLeaveCount}
                        </span>
                      </div>
                      <div className="rounded-xl bg-amber-50/60 dark:bg-amber-950/30 p-2">
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 block">
                          Late/Abs
                        </span>
                        <span className="text-xs font-bold font-mono text-amber-700 dark:text-amber-300">
                          {d.lateCount + d.absentCount}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
                        style={{ width: `${Math.min(100, d.attendancePercentage)}%` }}
                      />
                    </div>

                    {/* Direct Roster Preview & Actions */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center -space-x-1.5 overflow-hidden">
                        {deptMembers.slice(0, 4).map((m) => (
                          <div
                            key={m.id}
                            title={`${m.name} (${m.designation})`}
                            className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-900 dark:bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center"
                          >
                            {m.initials}
                          </div>
                        ))}
                        <span className="pl-3 text-[11px] text-slate-500 dark:text-slate-400">
                          {deptMembers.length} listed in directory
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setDept(d.department);
                            setSubView('directory');
                          }}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          View Staff
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOrgFilterDept(d.department);
                            setSubView('org_chart');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Network className="w-3 h-3" />
                          Org Tree
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 3: INTERACTIVE ENTERPRISE ORG CHART MODULE
      ===================================================================== */}
      {subView === 'org_chart' && (
        <OrganizationChartModule
          key={orgFilterDept}
          data={data}
          canEdit={canEdit}
          initialDepartmentFilter={orgFilterDept}
          onOpenAddEmployee={onOpenAddEmployee}
          onSuccessToast={onSuccessToast}
        />
      )}
    </div>
  );
}

interface AttendanceScreenProps {
  data: HrDashboardDataState;
  onNavigateHomeTab: (tab: HomeInternalTab) => void;
  onNavigateBottomTab: (tab: BottomNavTab) => void;
  onSuccessToast?: (msg: string) => void;
}

export function AttendanceScreen({
  data,
  onNavigateHomeTab,
  onNavigateBottomTab,
  onSuccessToast,
}: AttendanceScreenProps) {
  const metrics = calculateAttendancePercentages(data.kpis.attendance);
  const [recordFaceAttendance, { isLoading: isRecordingFace }] =
    useRecordFaceAttendanceMutation();

  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empId, setEmpId] = useState('');
  const [empDept, setEmpDept] = useState('Engineering');
  const [shiftType, setShiftType] = useState('General Shift');
  const [punchType, setPunchType] = useState<
    'Check-In' | 'Late Check-In' | 'Check-Out'
  >('Check-In');
  const [locationTag, setLocationTag] = useState(
    'GPS Verified · Corporate Hub'
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (!isFaceModalOpen) {
      stopCameraStream();
      return;
    }

    let cancelled = false;

    async function initCamera() {
      await Promise.resolve();
      if (cancelled) return;
      setCameraError(null);
      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setCameraError('Camera stream unavailable in this browser session. Biometric liveness mode ready.');
        setCameraActive(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch {
        if (!cancelled) {
          setCameraError(
            'Live webcam permission not granted or unavailable. Ready for instant biometric verification.'
          );
          setCameraActive(false);
        }
      }
    }

    initCamera();

    return () => {
      cancelled = true;
      stopCameraStream();
    };
  }, [isFaceModalOpen]);

  const handleSelectEnrolledEmployee = (selectedId: string) => {
    const found = data.workforce.find((w) => w.employeeId === selectedId);
    if (found) {
      setEmpName(found.name);
      setEmpId(found.employeeId);
      setEmpDept(found.department);
      setShiftType(found.shift || 'General Shift');
      setLocationTag(found.location || 'GPS Verified · Corporate Hub');
    }
  };

  const handleCaptureFaceAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = empName.trim();
    if (!cleanName) return;

    setIsScanning(true);

    let snapshotDataUrl: string | undefined;
    if (cameraActive && videoRef.current) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 320;
        canvas.height = videoRef.current.videoHeight || 240;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          snapshotDataUrl = canvas.toDataURL('image/jpeg', 0.75);
        }
      } catch {
        snapshotDataUrl = undefined;
      }
    }

    try {
      const res = await recordFaceAttendance({
        employeeName: cleanName,
        employeeId: empId.trim() || undefined,
        department: empDept.trim() || 'General',
        shift: shiftType,
        punchType,
        location: locationTag,
        snapshotDataUrl,
      }).unwrap();

      onSuccessToast?.(res.message);
      setIsScanning(false);
      setIsFaceModalOpen(false);
      setEmpName('');
      setEmpId('');
    } catch {
      setIsScanning(false);
      onSuccessToast?.('Unable to record face attendance.');
    }
  };

  const faceLogs = data.faceAttendanceLogs || [];

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

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFaceModalOpen(true)}
            data-testid="open-face-attendance-btn"
            className="min-h-[40px] px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <ScanFace className="w-4 h-4" />
            <span>Face Attendance</span>
          </button>
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
            className="min-h-[40px] px-3.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
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

      {/* Face Attendance & Biometric Logs Section */}
      <div
        data-testid="face-attendance-logs-section"
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <ScanFace className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Face Attendance Logs ({faceLogs.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI facial recognition &amp; geo-fenced liveness check-in records
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsFaceModalOpen(true)}
            data-testid="scan-face-checkin-inline-btn"
            className="min-h-[36px] px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Face Now</span>
          </button>
        </div>

        {faceLogs.length === 0 ? (
          <div
            data-testid="face-attendance-empty-state"
            className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2"
          >
            <ScanFace className="w-7 h-7 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No face attendance punches recorded today
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Click Face Attendance to launch the camera scanner and mark biometric check-in or check-out.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {faceLogs.map((log) => (
              <div
                key={log.id}
                data-testid={`face-attendance-log-${log.id}`}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {log.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {log.employeeId}
                      </span>
                      <span>·</span>
                      <span className="truncate">{log.department}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {log.employeeName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {log.shift} · {log.location}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-0.5">
                  <span
                    className={`inline-block text-[11px] font-mono font-bold ${
                      log.punchType === 'Check-In'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : log.punchType === 'Late Check-In'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {log.punchType}
                  </span>
                  <p className="text-[11px] font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                    {log.timestamp}
                  </p>
                  <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                    Face Match {log.confidenceScore}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Department Attendance Breakdown */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3.5">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Department Attendance Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.departments.length === 0 ? (
            <div className="md:col-span-2 p-6 rounded-xl border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
              No department attendance records available today.
            </div>
          ) : (
            data.departments.map((d) => (
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
            ))
          )}
        </div>
      </div>

      {/* FACE ATTENDANCE SCANNER MODAL */}
      {isFaceModalOpen && (
        <div
          data-testid="face-attendance-modal"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <ScanFace className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Biometric Face Attendance
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Live AI facial recognition &amp; geo-fenced attendance punch
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFaceModalOpen(false)}
                aria-label="Close Face Attendance Modal"
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Camera Viewfinder */}
            <div className="relative w-full h-52 rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  cameraActive ? 'block' : 'hidden'
                }`}
              />

              {!cameraActive && (
                <div className="text-center px-4 space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto">
                    <ScanFace className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-semibold text-white">
                    Biometric Face Scanner Ready
                  </p>
                  {cameraError && (
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      {cameraError}
                    </p>
                  )}
                </div>
              )}

              {/* Biometric Face Reticle Corners Overlay */}
              <div className="pointer-events-none absolute inset-6 border border-dashed border-indigo-400/50 rounded-2xl flex items-end justify-between p-2.5">
                <span className="text-[10px] font-mono text-emerald-400 bg-slate-950/75 px-2 py-0.5 rounded-md">
                  Liveness: Active
                </span>
                <span className="text-[10px] font-mono text-indigo-300 bg-slate-950/75 px-2 py-0.5 rounded-md">
                  {locationTag}
                </span>
              </div>
            </div>

            <form onSubmit={handleCaptureFaceAttendance} className="space-y-3.5">
              {data.workforce.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Quick-Select Enrolled Employee
                  </label>
                  <select
                    onChange={(e) => handleSelectEnrolledEmployee(e.target.value)}
                    defaultValue=""
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="">-- Select from Workforce Directory --</option>
                    {data.workforce.map((emp) => (
                      <option key={emp.id} value={emp.employeeId}>
                        {emp.name} ({emp.employeeId} · {emp.department})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Employee Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    placeholder="e.g., Aarav Sharma"
                    data-testid="face-attendance-name-input"
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={empId}
                    onChange={(e) => setEmpId(e.target.value)}
                    placeholder="e.g., EMP-3601"
                    data-testid="face-attendance-id-input"
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Department
                  </label>
                  <input
                    type="text"
                    value={empDept}
                    onChange={(e) => setEmpDept(e.target.value)}
                    placeholder="e.g., Engineering"
                    data-testid="face-attendance-dept-input"
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Shift
                  </label>
                  <select
                    value={shiftType}
                    onChange={(e) => setShiftType(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="General Shift">General Shift</option>
                    <option value="Morning Shift">Morning Shift</option>
                    <option value="Night Shift">Night Shift</option>
                    <option value="Flexible Shift">Flexible Shift</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Punch Type
                  </label>
                  <select
                    value={punchType}
                    onChange={(e) =>
                      setPunchType(
                        e.target.value as
                          | 'Check-In'
                          | 'Late Check-In'
                          | 'Check-Out'
                      )
                    }
                    data-testid="face-attendance-punch-select"
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Check-In">Check-In (On-Time)</option>
                    <option value="Late Check-In">Late Check-In</option>
                    <option value="Check-Out">Check-Out</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFaceModalOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecordingFace || isScanning}
                  data-testid="capture-face-attendance-btn"
                  className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ScanFace className="w-4 h-4" />
                  <span>
                    {isRecordingFace || isScanning
                      ? 'Verifying Face...'
                      : 'Scan Face & Mark Attendance'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);
  const [decideApproval, { isLoading }] = useDecideApprovalMutation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target as Node)
      ) {
        setIsCategoryMenuOpen(false);
      }
    }
    if (isCategoryMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryMenuOpen]);

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
      {/* Status Filters & Three-Dot Category Menu */}
      <div
        ref={categoryMenuRef}
        className="relative flex items-center justify-between gap-2.5"
      >
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

        <button
          type="button"
          onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
          aria-expanded={isCategoryMenuOpen}
          aria-label="Toggle Approval Categories menu"
          data-testid="approvals-category-menu-trigger"
          title="Approval Categories"
          className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {isCategoryMenuOpen && (
          <div
            data-testid="approvals-category-menu-popup"
            className="absolute right-0 top-11 z-50 w-60 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl transition-all duration-200 animate-in fade-in zoom-in-95 space-y-1"
          >
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
                onClick={() => {
                  setCategory(cat);
                  setIsCategoryMenuOpen(false);
                }}
                data-testid={`approvals-category-option-${cat}`}
                className={`w-full min-h-[38px] px-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 text-left transition-colors cursor-pointer ${
                  category === cat
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{cat}</span>
                {category === cat && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            ))}
          </div>
        )}
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
  onRoleChange?: (role: Ofc360Role) => void;
  selectedModuleId?: MoreModuleId | null;
  onSelectModuleId?: (id: MoreModuleId | null) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenAnnouncement: () => void;
  onNavigateBottomTab: (tab: BottomNavTab) => void;
  onNavigateHomeTab: (tab: HomeInternalTab) => void;
  onSuccessToast: (msg: string) => void;
}

export function getModuleIcon(id: MoreModuleId) {
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

export function MoreModulesScreen({
  data,
  canEdit,
  activeRole = 'hr_admin',
  onRoleChange,
  selectedModuleId,
  onSelectModuleId,
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
  const [internalSubModule, setInternalSubModule] = useState<MoreModuleId | null>(
    null
  );

  const activeSubModule =
    selectedModuleId !== undefined ? selectedModuleId : internalSubModule;
  const setActiveSubModule = (modId: MoreModuleId | null) => {
    if (onSelectModuleId) {
      onSelectModuleId(modId);
    } else {
      setInternalSubModule(modId);
    }
  };

  // RTK Query Mutations
  const [triggerPayroll, { isLoading }] = useTriggerPayrollRunMutation();
  const [updateAnnouncement] = useUpdateAnnouncementMutation();
  const [deleteAnnouncement] = useDeleteAnnouncementMutation();
  const [createRequisition, { isLoading: isCreatingReq }] =
    useCreateRequisitionMutation();
  const [advanceRequisitionStage] = useAdvanceRequisitionStageMutation();

  // Recruitment Form State
  const [reqTitle, setReqTitle] = useState('');
  const [reqDept, setReqDept] = useState('Engineering');
  const [reqOpenings, setReqOpenings] = useState('2');

  // People AI Query State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponses, setAiResponses] = useState<
    { id: string; question: string; answer: string }[]
  >([
    {
      id: 'AI-1',
      question: 'Summarize current workforce headcount, attendance, and attrition risk.',
      answer: `Active Workforce: ${data.kpis.workforce.totalActive} employees (+${data.kpis.workforce.growthPercentage}% MoM). Today's Attendance: ${data.kpis.attendance.ratePercentage}% (${data.kpis.attendance.present} Present, ${data.kpis.attendance.late} Late, ${data.kpis.attendance.onLeave} On Leave). Retention stability is 97.8% with ${data.exits.length} scheduled offboardings.`,
    },
  ]);

  // Reports Builder State
  const [reportCategory, setReportCategory] = useState<
    'Workforce' | 'Attendance' | 'Payroll' | 'Recruitment' | 'Compliance'
  >('Workforce');

  // Employee Documents State
  const [empDocs, setEmpDocs] = useState([
    {
      id: 'EDOC-101',
      employee: 'Elena Rostova (EMP-3602)',
      title: 'Signed Employment Contract & NDA',
      category: 'Contract',
      expiry: 'Permanent',
      status: 'Verified',
    },
    {
      id: 'EDOC-102',
      employee: 'Sora Takahashi (EMP-3608)',
      title: 'Passport & Work Permit KYC',
      category: 'Identity KYC',
      expiry: '2030-08-14',
      status: 'Verified',
    },
    {
      id: 'EDOC-103',
      employee: 'Marcus Vance (EMP-3614)',
      title: 'Previous Employer Relieving & Experience Letter',
      category: 'Background Check',
      expiry: 'Permanent',
      status: 'Pending Review',
    },
  ]);
  const [newDocEmp, setNewDocEmp] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');

  // Company Policies State
  const [policiesList, setPoliciesList] = useState([
    {
      code: 'POL-2026-01',
      title: 'OFC360 Global Employee Handbook & Code of Conduct v4.2',
      department: 'All Departments',
      acknowledgement: '99.4% Acknowledged',
      status: 'Published',
    },
    {
      code: 'POL-2026-02',
      title: 'Hybrid Work, Shift Allowance & Flexible Hours Policy',
      department: 'Engineering & Product',
      acknowledgement: '96.8% Acknowledged',
      status: 'Published',
    },
    {
      code: 'POL-2026-03',
      title: 'Travel Reimbursement & Corporate Per Diem Guidelines',
      department: 'Enterprise Sales & Ops',
      acknowledgement: '94.2% Acknowledged',
      status: 'Published',
    },
  ]);
  const [newPolicyTitle, setNewPolicyTitle] = useState('');
  const [newPolicyDept, setNewPolicyDept] = useState('All Departments');

  // Statutory Compliance Center State
  const [complianceItems, setComplianceItems] = useState([
    {
      id: 'CMP-PF-11',
      statute: 'Provident Fund (EPFO ECR Filing)',
      cycle: 'Nov 2026',
      dueDate: 'Nov 15, 2026',
      status: 'Compliant',
      coverage: '348 / 348 Staff',
    },
    {
      id: 'CMP-TDS-11',
      statute: 'Income Tax TDS (Form 24Q Challan)',
      cycle: 'Nov 2026',
      dueDate: 'Nov 07, 2026',
      status: 'Compliant',
      coverage: '$412,800 Withheld',
    },
    {
      id: 'CMP-ESI-11',
      statute: 'Employee State Insurance (ESIC) & Professional Tax (PT)',
      cycle: 'Nov 2026',
      dueDate: 'Nov 15, 2026',
      status: 'Compliant',
      coverage: 'All State Hubs',
    },
    {
      id: 'CMP-POSH-26',
      statute: 'POSH Annual IC Audit & SOC2 Type II People Controls',
      cycle: 'FY 2026',
      dueDate: 'Dec 31, 2026',
      status: 'Pending Review',
      coverage: '99.4% Certified',
    },
  ]);
  const [newComplianceStatute, setNewComplianceStatute] = useState('');
  const [newComplianceDue, setNewComplianceDue] = useState('Dec 15, 2026');

  // Performance & Goals State
  const [okrGoals, setOkrGoals] = useState([
    {
      id: 'OKR-1',
      title: 'Engineering Platform Reliability & Velocity OKRs',
      completion: '94%',
      lead: 'Elena Rostova',
      status: 'On Track',
    },
    {
      id: 'OKR-2',
      title: 'Product & Design Systems Accessibility 360° Cycle',
      completion: '89%',
      lead: 'Sora Takahashi',
      status: 'On Track',
    },
    {
      id: 'OKR-3',
      title: 'Enterprise Sales Q4 ARR Expansion Targets',
      completion: '91%',
      lead: 'Marcus Vance',
      status: 'Calibrated',
    },
  ]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalLead, setNewGoalLead] = useState('');

  // Exit Management State
  const [exitRecords, setExitRecords] = useState(() => data.exits);
  const [newExitName, setNewExitName] = useState('');
  const [newExitDept, setNewExitDept] = useState('Engineering');

  // Audio & Video Meetings State
  const [meetingsList, setMeetingsList] = useState([
    {
      id: 'MTG-1',
      title: 'Weekly People & Culture Sync',
      time: '11:30 AM – 12:15 PM IST',
      participants: '14 Joined',
      roomCode: 'OFC-SYNC-101',
    },
    {
      id: 'MTG-2',
      title: 'Staff Rust Engineer Final Panel',
      time: '03:00 PM – 04:00 PM IST',
      participants: '4 Panelists',
      roomCode: 'OFC-HIRE-204',
    },
  ]);
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingTime, setNewMeetingTime] = useState('04:30 PM – 05:00 PM IST');

  // OFC Connect Chat State
  const [activeChannel, setActiveChannel] = useState('#hr-leadership-ops');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'MSG-1',
      channel: '#hr-leadership-ops',
      sender: 'Elena Rostova (Engineering)',
      time: '09:42 AM',
      text: 'Hi Aarav, Q4 backend hiring panel slots are confirmed for Thursday.',
    },
    {
      id: 'MSG-2',
      channel: '#hr-leadership-ops',
      sender: 'Vikramaditya Nair (DevOps)',
      time: '10:05 AM',
      text: 'APAC Night Shift roster handoff completed with 100% coverage.',
    },
    {
      id: 'MSG-3',
      channel: '#payroll-finance',
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

  const handleDownloadCsv = (reportName: string) => {
    const rows = [
      ['Employee ID', 'Name', 'Department', 'Designation', 'Location', 'Status', 'Attendance %'],
      ...data.workforce.map((e) => [
        e.employeeId,
        e.name,
        e.department,
        e.designation,
        e.location,
        e.status,
        String(e.attendanceRate),
      ]),
    ];
    const csvContent = rows.map((r) => r.join(',')).join('\n');
    if (typeof window !== 'undefined' && typeof Blob !== 'undefined') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OFC360_${reportName.replace(/\s+/g, '_')}_2026.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    onSuccessToast(`Exported ${reportName} CSV report (${data.workforce.length} records).`);
  };

  const handleSelectModule = (mod: MoreModuleItem) => {
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
        channel: activeChannel,
        sender: `${data.adminProfile.name} (You)`,
        time: 'Just now',
        text: chatMessage.trim(),
      },
    ]);
    setChatMessage('');
    onSuccessToast(`Message delivered to ${activeChannel}.`);
  };

  const handleAskPeopleAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    const q = aiQuery.trim();
    const lower = q.toLowerCase();
    let answer = `Based on OFC360 live telemetry: ${data.kpis.workforce.totalActive} active employees across ${data.departments.length} departments, ${data.kpis.attendance.ratePercentage}% daily attendance, ${data.kpis.approvals.totalPending} pending approvals, and ${data.kpis.recruitment.openPositions} open hiring positions.`;
    if (lower.includes('payroll') || lower.includes('salary') || lower.includes('tax')) {
      answer = `Payroll Intelligence (${data.kpis.payroll.cycleName}): Net payable is ${data.kpis.payroll.netPayableFormatted} with ${data.kpis.payroll.taxWithheldFormatted} tax withheld across ${data.kpis.payroll.eligibleEmployees} eligible employees. Compliance score is ${data.kpis.payroll.complianceScore}% and status is ${data.kpis.payroll.status}.`;
    } else if (lower.includes('attendance') || lower.includes('late') || lower.includes('leave')) {
      answer = `Attendance Intelligence: ${data.kpis.attendance.present} Present, ${data.kpis.attendance.late} Late arrivals, ${data.kpis.attendance.onLeave} On Leave, and ${data.kpis.attendance.absent} Unplanned Absent (${data.kpis.attendance.ratePercentage}% overall rate).`;
    } else if (lower.includes('hiring') || lower.includes('recruit') || lower.includes('open')) {
      answer = `Recruitment Intelligence: ${data.kpis.recruitment.openPositions} open positions across ${data.kpis.recruitment.activeRequisitionsCount} active requisitions with ${data.kpis.recruitment.candidatesInPipeline} candidates in pipeline.`;
    }
    setAiResponses((prev) => [
      { id: `AI-${Date.now()}`, question: q, answer },
      ...prev,
    ]);
    setAiQuery('');
    onSuccessToast('People AI generated data-backed insight.');
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
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block">
                  {activeModuleMeta.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeModuleMeta.title}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDownloadCsv(activeModuleMeta.title)}
              className="min-h-[38px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>

          {/* 1A. PAYROLL EXECUTION WORKSPACE */}
          {activeSubModule === 'payroll' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
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
                    Tax Withheld (TDS/PF/ESI)
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
                    Statutory Compliance
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {data.kpis.payroll.complianceScore}%
                  </span>
                </div>
              </div>

              {/* Employee Payslip & Salary Structure Register */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Employee Salary Register &amp; Payslip Disbursement
                </h5>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.workforce.slice(0, 5).map((emp) => (
                    <div
                      key={emp.id}
                      className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {emp.name}
                        </span>{' '}
                        <span className="font-mono text-slate-500">
                          ({emp.employeeId} · {emp.department})
                        </span>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Basic + HRA + Special Allowance · PF &amp; TDS Verified
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onSuccessToast(
                            `Payslip PDF generated and emailed to ${emp.name} (${emp.email}).`
                          )
                        }
                        className="min-h-[34px] px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer self-start sm:self-auto"
                      >
                        Generate Payslip
                      </button>
                    </div>
                  ))}
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
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Active Hiring Requisitions (
                    {data.kpis.recruitment.openPositions} Positions)
                  </h4>
                  <p className="text-xs text-slate-500">
                    ATS candidate pipeline, interview panels, and offer workflows
                  </p>
                </div>
                <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 tabular-nums font-semibold">
                  {data.kpis.recruitment.candidatesInPipeline} Candidates in Pipeline
                </span>
              </div>

              {canEdit && (
                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    + Publish New Job Requisition
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={reqTitle}
                      onChange={(e) => setReqTitle(e.target.value)}
                      placeholder="Role title (e.g. Staff AI Engineer)"
                      className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    />
                    <select
                      value={reqDept}
                      onChange={(e) => setReqDept(e.target.value)}
                      className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product & Design">Product &amp; Design</option>
                      <option value="Enterprise Sales">Enterprise Sales</option>
                      <option value="People Operations">People Operations</option>
                      <option value="Finance & Legal">Finance &amp; Legal</option>
                    </select>
                    <input
                      type="number"
                      min={1}
                      value={reqOpenings}
                      onChange={(e) => setReqOpenings(e.target.value)}
                      placeholder="Openings"
                      className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-mono"
                    />
                    <button
                      type="button"
                      disabled={isCreatingReq}
                      onClick={async () => {
                        if (!reqTitle.trim()) return;
                        try {
                          const res = await createRequisition({
                            title: reqTitle.trim(),
                            department: reqDept,
                            openings: Number(reqOpenings) || 1,
                          }).unwrap();
                          setReqTitle('');
                          onSuccessToast(res.message);
                        } catch {
                          onSuccessToast('Unable to publish job requisition.');
                        }
                      }}
                      className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      Publish Role
                    </button>
                  </div>
                </div>
              )}

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.requisitions.map((req) => (
                  <div
                    key={req.id}
                    className="py-3 first:pt-1 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {req.id} · {req.department} · {req.location}
                      </span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {req.title}
                      </p>
                      <p className="text-xs font-mono tabular-nums text-slate-500 mt-0.5">
                        {req.openings} Openings · {req.candidatesInPipeline}{' '}
                        Candidates · Stage:{' '}
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {req.stage}
                        </span>
                      </p>
                    </div>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={async () => {
                          const nextStage =
                            req.stage === 'Sourcing'
                              ? 'Technical Round'
                              : req.stage === 'Technical Round'
                              ? 'Offer Extended'
                              : 'Sourcing';
                          const res = await advanceRequisitionStage({
                            id: req.id,
                            stage: nextStage,
                          }).unwrap();
                          onSuccessToast(res.message);
                        }}
                        className="min-h-[34px] px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer self-start sm:self-auto"
                      >
                        Advance Stage &rarr;
                      </button>
                    )}
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
                        <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          · {j.onboardingStatus}
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
                      onClick={() => {
                        setOnboardingJoiners((prev) =>
                          prev.map((item) =>
                            item.id === j.id
                              ? { ...item, onboardingStatus: 'Verified' }
                              : item
                          )
                        );
                        onSuccessToast(`Day-1 orientation agenda & KYC verified for ${j.name}.`);
                      }}
                      className="min-h-[36px] px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer self-start sm:self-auto"
                    >
                      {j.onboardingStatus === 'Verified' ? 'Verified ✓' : 'Complete Induction'}
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
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {assetsList.filter((a) => a.status === 'Allocated').length} Allocated
                  </span>
                  <span>·</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {assetsList.filter((a) => a.status === 'In Stock').length} In Stock
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
                        <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                          · {asset.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Assigned To: <span className="font-semibold text-slate-700 dark:text-slate-200">{asset.assignedTo}</span> · Serial: {asset.serial} · Category: {asset.category}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAssetsList((prev) =>
                          prev.map((a) =>
                            a.id === asset.id
                              ? {
                                  ...a,
                                  status:
                                    a.status === 'Allocated'
                                      ? 'In Stock'
                                      : 'Allocated',
                                }
                              : a
                          )
                        );
                        onSuccessToast(`Updated inventory status for ${asset.id}.`);
                      }}
                      className="min-h-[34px] px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer self-start sm:self-auto"
                    >
                      {asset.status === 'Allocated' ? 'Mark Returned' : 'Assign from Pool'}
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
                <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {visitorList.filter((v) => v.status !== 'Checked Out').length} On Premise
                </span>
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
                          ({vis.organization}) · {vis.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Host: <span className="font-semibold text-slate-700 dark:text-slate-200">{vis.host}</span> · Purpose: {vis.purpose} · {vis.badgeNo} · Entry: {vis.entryTime}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setVisitorList((prev) =>
                          prev.map((v) =>
                            v.id === vis.id
                              ? {
                                  ...v,
                                  status:
                                    v.status === 'Checked Out'
                                      ? 'Checked In'
                                      : 'Checked Out',
                                }
                              : v
                          )
                        );
                        onSuccessToast(`Updated check-in status for ${vis.guestName}.`);
                      }}
                      className="min-h-[34px] px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer self-start sm:self-auto"
                    >
                      {vis.status === 'Checked Out' ? 'Check In Again' : 'Check Out'}
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
                <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                  Corporate Rate: Active
                </span>
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
                          {trip.route} · {trip.status}
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
                      onClick={() => {
                        setTravelTrips((prev) =>
                          prev.map((t) =>
                            t.id === trip.id ? { ...t, status: 'Approved' } : t
                          )
                        );
                        onSuccessToast(`Travel vouchers & reimbursement approved for ${trip.id}.`);
                      }}
                      className="min-h-[34px] px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer self-start sm:self-auto"
                    >
                      {trip.status === 'Approved' ? 'Vouchers Issued' : 'Approve Trip'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. EXIT MANAGEMENT WORKSPACE */}
          {activeSubModule === 'exit_management' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Active Offboarding, FnF Settlement &amp; Clearance Queue ({exitRecords.length})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Notice period tracking, exit interviews, IT asset recovery, and relieving letters
                  </p>
                </div>
              </div>

              {canEdit && (
                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    + Initiate Employee Resignation / Offboarding Workflow
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newExitName}
                      onChange={(e) => setNewExitName(e.target.value)}
                      placeholder="Employee full name"
                      className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    />
                    <select
                      value={newExitDept}
                      onChange={(e) => setNewExitDept(e.target.value)}
                      className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product & Design">Product &amp; Design</option>
                      <option value="Enterprise Sales">Enterprise Sales</option>
                      <option value="Operations">Operations</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newExitName.trim()) return;
                        setExitRecords((prev) => [
                          {
                            id: `EXT-${300 + prev.length + 1}`,
                            employeeId: `EMP-${3640 + prev.length}`,
                            name: newExitName.trim(),
                            department: newExitDept,
                            designation: 'Senior Associate',
                            lastWorkingDay: 'Dec 15, 2026',
                            exitStatus: 'Clearance Pending',
                            initials: newExitName.trim().slice(0, 2).toUpperCase(),
                          },
                          ...prev,
                        ]);
                        setNewExitName('');
                        onSuccessToast(`Offboarding checklist initiated for ${newExitName.trim()}.`);
                      }}
                      className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      Start Offboarding
                    </button>
                  </div>
                </div>
              )}

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {exitRecords.map((ex) => (
                  <div
                    key={ex.id}
                    className="py-3 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {ex.name} <span className="font-mono text-xs text-slate-500">({ex.employeeId})</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {ex.designation} · {ex.department} · Last Working Day:{' '}
                        {ex.lastWorkingDay} · Status:{' '}
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          {ex.exitStatus}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setExitRecords((prev) =>
                          prev.map((item) =>
                            item.id === ex.id
                              ? { ...item, exitStatus: 'FnF Processed' }
                              : item
                          )
                        );
                        onSuccessToast(
                          `FnF settlement, IT asset clearance & Relieving Letter verified for ${ex.name}.`
                        );
                      }}
                      className="min-h-[38px] px-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-semibold cursor-pointer"
                    >
                      {ex.exitStatus === 'FnF Processed' ? 'FnF Completed ✓' : 'Verify Clearance & FnF'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. PERFORMANCE & GOALS WORKSPACE */}
          {activeSubModule === 'performance_goals' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Q4 2026 OKR, KPI &amp; 360° Appraisal Cycle
                  </h4>
                  <p className="text-xs text-slate-500">
                    Self-assessments, manager reviews, PIP tracking, and promotion calibrations
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

              {canEdit && (
                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    + Create Department OKR / Performance Goal
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                      placeholder="OKR objective title"
                      className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={newGoalLead}
                      onChange={(e) => setNewGoalLead(e.target.value)}
                      placeholder="Owner / Department Lead"
                      className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newGoalTitle.trim()) return;
                        setOkrGoals((prev) => [
                          {
                            id: `OKR-${prev.length + 1}`,
                            title: newGoalTitle.trim(),
                            completion: '75%',
                            lead: newGoalLead.trim() || data.adminProfile.name,
                            status: 'On Track',
                          },
                          ...prev,
                        ]);
                        setNewGoalTitle('');
                        setNewGoalLead('');
                        onSuccessToast('New OKR objective added to Q4 appraisal cycle.');
                      }}
                      className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      Save OKR
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {okrGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2"
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
                      Lead: {goal.lead} · {goal.status}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setOkrGoals((prev) =>
                          prev.map((g) =>
                            g.id === goal.id
                              ? { ...g, completion: '100%', status: 'Calibrated' }
                              : g
                          )
                        );
                        onSuccessToast(`360° appraisal calibrated for ${goal.title}.`);
                      }}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Approve Calibration &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. OFC CONNECT CHAT WORKSPACE */}
          {activeSubModule === 'ofc_connect_chat' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    OFC Connect Enterprise Channels
                  </h4>
                  <p className="text-xs text-slate-500">
                    Real-time 1:1 and department messaging with read receipts
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {['#hr-leadership-ops', '#payroll-finance', '#eng-hiring'].map(
                    (ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setActiveChannel(ch)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold cursor-pointer ${
                          activeChannel === ch
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {ch}
                      </button>
                    )
                  )}
                </div>
              </div>
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {chatHistory
                  .filter((m) => !m.channel || m.channel === activeChannel)
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {msg.sender}
                        </span>
                        <span className="font-mono text-slate-400">
                          {msg.time} · Read ✓✓
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
                  placeholder={`Message ${activeChannel}...`}
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
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Scheduled Audio &amp; Video Meeting Rooms ({meetingsList.length})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Schedule interview bridges, department syncs, and executive townhalls
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  + Schedule New Meeting Bridge
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newMeetingTitle}
                    onChange={(e) => setNewMeetingTitle(e.target.value)}
                    placeholder="Meeting title (e.g. Q4 Compensation Review)"
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={newMeetingTime}
                    onChange={(e) => setNewMeetingTime(e.target.value)}
                    placeholder="Time slot"
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newMeetingTitle.trim()) return;
                      const roomCode = `OFC-ROOM-${300 + meetingsList.length + 1}`;
                      setMeetingsList((prev) => [
                        {
                          id: `MTG-${Date.now()}`,
                          title: newMeetingTitle.trim(),
                          time: newMeetingTime.trim() || '04:00 PM IST',
                          participants: 'Invited Panel',
                          roomCode,
                        },
                        ...prev,
                      ]);
                      setNewMeetingTitle('');
                      onSuccessToast(`Meeting scheduled with room code ${roomCode}.`);
                    }}
                    className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Schedule Room
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {meetingsList.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {m.title}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {m.time} · {m.participants} · Room: {m.roomCode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onSuccessToast(`Copied meeting room link (${m.roomCode}) to clipboard.`)
                      }
                      className="min-h-[36px] px-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      Copy Room Link
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
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Corporate Broadcasts &amp; Department Announcements ({data.announcements.length})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Publish, schedule, unpublish, or delete priority-targeted broadcasts
                  </p>
                </div>
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
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {ann.category} · {ann.priority} Priority · {ann.department} · Status: {ann.status}
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
                    {canEdit && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={async () => {
                            const res = await updateAnnouncement({
                              id: ann.id,
                              status:
                                ann.status === 'Published' ? 'Draft' : 'Published',
                            }).unwrap();
                            onSuccessToast(res.message);
                          }}
                          className="min-h-[32px] px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          {ann.status === 'Published' ? 'Unpublish to Draft' : 'Publish Now'}
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const res = await deleteAnnouncement({
                              id: ann.id,
                            }).unwrap();
                            onSuccessToast(res.message);
                          }}
                          className="min-h-[32px] px-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-xs font-semibold text-rose-600 dark:text-rose-400 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8A. PEOPLE AI / INTELLIGENCE HUB WORKSPACE */}
          {activeSubModule === 'people_ai' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    People AI &amp; Workforce Intelligence Hub
                  </h4>
                  <p className="text-xs text-slate-500">
                    Ask natural language questions across workforce, attendance, payroll, and attrition telemetry
                  </p>
                </div>
              </div>

              <form onSubmit={handleAskPeopleAi} className="flex gap-2">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask People AI (e.g., Summarize November payroll tax or attendance compliance)..."
                  className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="h-10 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Analyze
                </button>
              </form>

              <div className="space-y-2.5">
                {aiResponses.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1 text-xs"
                  >
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">
                      Q: {item.question}
                    </p>
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8B. REPORTS & ANALYTICS / WORKFORCE ANALYTICS / ATTENDANCE ANALYTICS */}
          {(activeSubModule === 'reports_analytics' ||
            activeSubModule === 'workforce_analytics' ||
            activeSubModule === 'attendance_analytics') && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeModuleMeta.title} — Live Enterprise Telemetry
                  </h4>
                  <p className="text-xs text-slate-500">
                    Departmental headcount velocity, shift adherence, and custom MIS exports
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={reportCategory}
                    onChange={(e) =>
                      setReportCategory(
                        e.target.value as
                          | 'Workforce'
                          | 'Attendance'
                          | 'Payroll'
                          | 'Recruitment'
                          | 'Compliance'
                      )
                    }
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="Workforce">Workforce Headcount Report</option>
                    <option value="Attendance">Daily Attendance &amp; Late Log</option>
                    <option value="Payroll">Payroll &amp; Statutory Tax Register</option>
                    <option value="Recruitment">ATS Hiring Funnel Report</option>
                    <option value="Compliance">PF / ESI / PT Statutory Audit</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDownloadCsv(`${reportCategory}_MIS`)}
                    className="min-h-[36px] px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Generate CSV
                  </button>
                </div>
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
                    Attendance Rate
                  </span>
                  <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {data.kpis.attendance.ratePercentage}%
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[11px] text-slate-500 block">
                    Present / Late / Leave
                  </span>
                  <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {data.kpis.attendance.present} / {data.kpis.attendance.late} / {data.kpis.attendance.onLeave}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[11px] text-slate-500 block">
                    New Joiners (MTD)
                  </span>
                  <span className="text-lg font-mono font-bold text-violet-600 dark:text-violet-400">
                    +{data.kpis.workforce.newHiresThisMonth}
                  </span>
                </div>
              </div>

              {/* Department Breakdown Table */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-2">
                {data.departments.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-500">
                    No department attendance records available.
                  </p>
                ) : (
                  data.departments.map((dept) => (
                    <div
                      key={dept.id}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {dept.department}
                        </span>
                        <span className="text-slate-500 ml-2">
                          Lead: {dept.headOfDept}
                        </span>
                      </div>
                      <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {dept.totalEmployees} Staff · {dept.presentCount} Present ·{' '}
                        <strong className="text-indigo-600 dark:text-indigo-400">
                          {dept.attendancePercentage}%
                        </strong>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 9A. EMPLOYEE DOCUMENTS WORKSPACE */}
          {activeSubModule === 'employee_documents' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Employee KYC &amp; Document Vault ({empDocs.length} Records)
                </h4>
                <p className="text-xs text-slate-500">
                  Upload, verify, and audit employee contracts, identity proofs, and letters
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newDocEmp}
                  onChange={(e) => setNewDocEmp(e.target.value)}
                  placeholder="Employee name & ID"
                  className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                />
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="Document title (e.g. PAN / Tax Declaration)"
                  className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newDocEmp.trim() || !newDocTitle.trim()) return;
                    setEmpDocs((prev) => [
                      {
                        id: `EDOC-${100 + prev.length + 1}`,
                        employee: newDocEmp.trim(),
                        title: newDocTitle.trim(),
                        category: 'KYC / Verification',
                        expiry: 'Permanent',
                        status: 'Verified',
                      },
                      ...prev,
                    ]);
                    setNewDocEmp('');
                    setNewDocTitle('');
                    onSuccessToast('Employee document added and verified.');
                  }}
                  className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Add Document
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {empDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                        {doc.id} · {doc.category} · {doc.status}
                      </span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {doc.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        Employee: {doc.employee} · Validity: {doc.expiry}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEmpDocs((prev) =>
                          prev.map((d) =>
                            d.id === doc.id ? { ...d, status: 'Verified' } : d
                          )
                        );
                        onSuccessToast(`Verified ${doc.id} (${doc.title}).`);
                      }}
                      className="min-h-[34px] px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      {doc.status === 'Verified' ? 'Verified ✓' : 'Verify Document'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9B. DOCUMENTS & POLICIES WORKSPACE */}
          {activeSubModule === 'documents_policies' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Company Policies, Handbooks &amp; SOPs ({policiesList.length})
                </h4>
                <p className="text-xs text-slate-500">
                  Publish organization-wide policies and track employee acknowledgement
                </p>
              </div>

              {canEdit && (
                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newPolicyTitle}
                    onChange={(e) => setNewPolicyTitle(e.target.value)}
                    placeholder="Policy title (e.g. AI Governance Charter)"
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  />
                  <input
                    type="text"
                    value={newPolicyDept}
                    onChange={(e) => setNewPolicyDept(e.target.value)}
                    placeholder="Target Department"
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newPolicyTitle.trim()) return;
                      setPoliciesList((prev) => [
                        {
                          code: `POL-2026-0${prev.length + 1}`,
                          title: newPolicyTitle.trim(),
                          department: newPolicyDept.trim() || 'All Departments',
                          acknowledgement: '100% Dispatched',
                          status: 'Published',
                        },
                        ...prev,
                      ]);
                      setNewPolicyTitle('');
                      onSuccessToast('Corporate policy published to employee handbook.');
                    }}
                    className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Publish Policy
                  </button>
                </div>
              )}

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {policiesList.map((pol) => (
                  <div
                    key={pol.code}
                    className="py-3 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                        {pol.code} · {pol.department} · {pol.status}
                      </span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {pol.title}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      {pol.acknowledgement}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9C. COMPLIANCE CENTER WORKSPACE */}
          {activeSubModule === 'compliance_center' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Statutory &amp; Regulatory Compliance Center ({complianceItems.length} Filings)
                </h4>
                <p className="text-xs text-slate-500">
                  Track PF, ESI, TDS, PT, Labour Law, and SOC2 / POSH statutory deadlines
                </p>
              </div>

              {canEdit && (
                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newComplianceStatute}
                    onChange={(e) => setNewComplianceStatute(e.target.value)}
                    placeholder="Statute / Filing name (e.g. Form 16 Part B)"
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  />
                  <input
                    type="text"
                    value={newComplianceDue}
                    onChange={(e) => setNewComplianceDue(e.target.value)}
                    placeholder="Due Date"
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newComplianceStatute.trim()) return;
                      setComplianceItems((prev) => [
                        {
                          id: `CMP-${100 + prev.length + 1}`,
                          statute: newComplianceStatute.trim(),
                          cycle: 'Q4 2026',
                          dueDate: newComplianceDue.trim() || 'Dec 15, 2026',
                          status: 'Compliant',
                          coverage: 'Verified',
                        },
                        ...prev,
                      ]);
                      setNewComplianceStatute('');
                      onSuccessToast('Statutory compliance task added.');
                    }}
                    className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Add Filing
                  </button>
                </div>
              )}

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {complianceItems.map((c) => (
                  <div
                    key={c.id}
                    className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                        {c.id} · Cycle: {c.cycle} · Due: {c.dueDate}
                      </span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {c.statute}
                      </p>
                      <p className="text-xs text-slate-500">
                        Coverage: {c.coverage} · Status: {c.status}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setComplianceItems((prev) =>
                          prev.map((item) =>
                            item.id === c.id
                              ? { ...item, status: 'Compliant' }
                              : item
                          )
                        );
                        onSuccessToast(`Marked ${c.statute} as Compliant & Filed.`);
                      }}
                      className="min-h-[34px] px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold cursor-pointer"
                    >
                      {c.status === 'Compliant' ? 'Compliant ✓' : 'Mark Filed'}
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
                Enterprise Organization, RBAC &amp; Application Settings
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

                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      Active RBAC Permission Role ({activeRole})
                    </p>
                    <p className="text-xs text-slate-500">
                      Test role-based module visibility and write permissions
                    </p>
                  </div>
                  {onRoleChange && (
                    <select
                      value={activeRole}
                      onChange={(e) => {
                        const r = e.target.value as Ofc360Role;
                        onRoleChange(r);
                        onSuccessToast(`Switched active RBAC role to ${r}.`);
                      }}
                      className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                    >
                      <option value="hr_admin">hr_admin (Full HR Admin)</option>
                      <option value="super_admin">super_admin (Super Admin)</option>
                      <option value="manager">manager (Department Manager)</option>
                      <option value="employee">employee (Read-Only Self-Service)</option>
                      <option value="it_admin">it_admin (IT Operations)</option>
                      <option value="executive">executive (Executive Viewer)</option>
                    </select>
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
  onLogout?: () => void;
}

export function ProfileScreen({
  data,
  activeRole,
  onSuccessToast,
  onLogout,
}: ProfileScreenProps) {
  const router = useRouter();
  const [adminInfo, setAdminInfo] = useState({
    name: data.adminProfile.name,
    designation: data.adminProfile.designation,
    email: data.adminProfile.email,
    department: data.adminProfile.department,
    location: data.adminProfile.location,
  });
  const [isEditingAdminInfo, setIsEditingAdminInfo] = useState(false);

  const handleSaveAdminInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingAdminInfo(false);
    onSuccessToast('HR profile details updated.');
  };

  const handleSignOut = () => {
    authClient.clearSession();
    void authClient.logout();
    if (onLogout) {
      onLogout();
      return;
    }
    router.push('/login');
  };

  const adminInitials =
    adminInfo.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'AS';

  return (
    <div className="space-y-5" data-testid="mobile-profile-screen">
      {/* HR Profile Information Card */}
      <div
        data-testid="hr-profile-info-card"
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5"
      >
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
                {adminInfo.designation} · {adminInfo.department}
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

        {/* HR Info Fields Grid */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Full Name
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">
              {adminInfo.name}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Employee ID
            </span>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
              {data.adminProfile.employeeId}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Designation
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">
              {adminInfo.designation}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Department
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">
              {adminInfo.department}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Email Address
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">
              {adminInfo.email}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Work Location
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">
              {adminInfo.location}
            </span>
          </div>
        </div>

        {isEditingAdminInfo && (
          <form
            onSubmit={handleSaveAdminInfo}
            className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3"
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
              type="text"
              value={adminInfo.department}
              onChange={(e) =>
                setAdminInfo((p) => ({ ...p, department: e.target.value }))
              }
              placeholder="Department"
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
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs sm:col-span-2"
            />
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
              >
                Save HR Info
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
