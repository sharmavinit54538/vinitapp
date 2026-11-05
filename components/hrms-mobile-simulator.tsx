'use client';

import React, { useState } from 'react';
import { IconConfig } from '@/lib/icon-math';
import {
  INITIAL_EMPLOYEES,
  INITIAL_LEAVE_REQUESTS,
  Employee360Record,
  LeaveRequestItem,
  filterEmployees,
  updateLeaveRequestStatus,
} from '@/lib/hrms-data';
import { Ofc360VectorIcon } from './ofc360-vector-icon';
import {
  Search,
  Check,
  X,
  Users,
  CalendarCheck,
  Sparkles,
  RotateCcw,
  Plus,
} from 'lucide-react';

interface HrmsMobileSimulatorProps {
  config: IconConfig;
}

export function HrmsMobileSimulator({ config }: HrmsMobileSimulatorProps) {
  const [showSplash, setShowSplash] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [employees, setEmployees] = useState<Employee360Record[]>(INITIAL_EMPLOYEES);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestItem[]>(
    INITIAL_LEAVE_REQUESTS
  );

  // Add New Employee 360 Record Form State
  const [newEmpName, setNewEmpName] = useState<string>('');
  const [newEmpRole, setNewEmpRole] = useState<string>('');
  const [newEmpDept, setNewEmpDept] = useState<Employee360Record['department']>('Engineering');
  const [formError, setFormError] = useState<string>('');

  const filteredList = filterEmployees(employees, searchQuery, departmentFilter);
  const pendingLeaves = leaveRequests.filter((r) => r.status === 'Pending').length;

  const handleLeaveAction = (id: string, status: 'Approved' | 'Declined') => {
    setLeaveRequests((prev) => updateLeaveRequestStatus(prev, id, status));
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newEmpName.trim();
    const trimmedRole = newEmpRole.trim();
    if (!trimmedName || !trimmedRole) {
      setFormError('Both Employee Name and Role Title are required.');
      return;
    }
    setFormError('');
    const parts = trimmedName.split(/\s+/);
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : trimmedName.slice(0, 2).toUpperCase();

    const newRecord: Employee360Record = {
      id: `EMP-${3600 + employees.length + 1}`,
      name: trimmedName,
      role: trimmedRole,
      department: newEmpDept,
      location: 'Global · Hybrid',
      review360Score: 5.0,
      attendanceRate: 100.0,
      status: 'Active',
      initials,
    };

    setEmployees((prev) => [newRecord, ...prev]);
    setNewEmpName('');
    setNewEmpRole('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" data-testid="hrms-mobile-simulator">
      {/* Left 5 Columns: Interactive Mobile Handset Preview (Splash + Live HRMS App Header) */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className="text-base font-semibold text-[#081B3A]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              OFC360 Mobile App Experience
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live mobile brand integration with splash launch and employee 360° telemetry
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSplash((s) => !s)}
            className="px-3 py-1.5 text-xs font-medium text-[#081B3A] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {showSplash ? 'Show Active Workspace' : 'Preview Launch Splash'}
          </button>
        </div>

        {/* Mobile Device Frame */}
        <div className="mx-auto max-w-[360px] rounded-[36px] border-[6px] border-[#081B3A] bg-[#F8FAFC] overflow-hidden shadow-md min-h-[560px] flex flex-col justify-between">
          {showSplash ? (
            /* Pure Minimalist Light Launch Splash Screen */
            <div
              data-testid="mobile-splash-screen"
              className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-white via-[#F8FAFC] to-slate-100"
            >
              <div className="w-28 h-28 rounded-[26px] overflow-hidden shadow-lg border border-slate-200/80 mb-6">
                <Ofc360VectorIcon config={config} frameless />
              </div>
              <h3
                className="text-2xl font-bold tracking-tight text-[#081B3A]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                OFC360
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-[220px]">
                Enterprise Workforce 360° Intelligence &amp; People Operations
              </p>
              <div className="mt-8 flex items-center gap-2 text-xs font-mono text-[#0052FF]">
                <span>SSO Verified · #081B3A / #0052FF</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSplash(false)}
                className="mt-8 px-4 py-2 text-xs font-semibold text-white bg-[#0052FF] hover:bg-[#081B3A] rounded-lg transition-colors"
              >
                Enter HRMS Portal
              </button>
            </div>
          ) : (
            /* Active Mobile HRMS Dashboard Inside Phone Frame */
            <div className="flex-1 flex flex-col">
              {/* Mobile Top App Bar with Live OFC360 Icon */}
              <div className="bg-[#081B3A] text-white px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[8px] overflow-hidden shrink-0 border border-white/15">
                    <Ofc360VectorIcon config={config} frameless />
                  </div>
                  <div>
                    <span
                      className="text-sm font-bold tracking-tight block leading-none"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      OFC360
                    </span>
                    <span className="text-[11px] text-slate-300 block mt-0.5">
                      Executive HRMS · Q4 Cycle
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono tabular-nums text-sky-300">
                  {employees.length} Staff
                </span>
              </div>

              {/* Mobile KPI Strip */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-white border-b border-slate-200">
                <div className="p-3 rounded-lg bg-[#F8FAFC] border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block">
                    360° Review Index
                  </span>
                  <span className="text-lg font-bold text-[#081B3A] font-mono tabular-nums mt-0.5 block">
                    4.86 / 5.0
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#F8FAFC] border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block">
                    Pending Approvals
                  </span>
                  <span
                    data-testid="mobile-pending-leaves-count"
                    className="text-lg font-bold text-[#0052FF] font-mono tabular-nums mt-0.5 block"
                  >
                    {pendingLeaves} Requests
                  </span>
                </div>
              </div>

              {/* Mobile Leave Approval Queue */}
              <div className="p-4 space-y-2.5 flex-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-[#081B3A]">
                    Leave &amp; Time-Off Queue
                  </span>
                  <span className="font-mono tabular-nums">
                    {leaveRequests.length} Total
                  </span>
                </div>

                {leaveRequests.length === 0 ? (
                  <div className="p-6 rounded-lg bg-white border border-slate-200 text-center space-y-1">
                    <p className="text-xs font-semibold text-[#081B3A]">No leave requests pending</p>
                    <p className="text-[11px] text-slate-500">All employee leave applications have been reviewed.</p>
                  </div>
                ) : (
                  leaveRequests.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#081B3A] truncate">
                        {item.employeeName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5 tabular-nums">
                        {item.leaveType} · {item.days}d ({item.dateRange})
                      </p>
                    </div>
                    {item.status === 'Pending' ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleLeaveAction(item.id, 'Approved')}
                          aria-label={`Approve leave for ${item.employeeName}`}
                          className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLeaveAction(item.id, 'Declined')}
                          aria-label={`Decline leave for ${item.employeeName}`}
                          className="p-1.5 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`text-[11px] font-medium shrink-0 ${
                          item.status === 'Approved'
                            ? 'text-emerald-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    )}
                  </div>
                )))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right 7 Columns: Enterprise Employee 360° Directory & Onboarding Form */}
      <div className="lg:col-span-7 space-y-6">
        {/* Directory Filter & Search Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h3
                className="text-base font-semibold text-[#081B3A]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                OFC360 Workforce 360° Directory
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Filter personnel by department or search employee ID, role, or location
              </p>
            </div>

            {/* Department Segmented Control */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {['All', 'Engineering', 'Product', 'People Ops', 'Finance'].map(
                (dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setDepartmentFilter(dept)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      departmentFilter === dept
                        ? 'bg-white text-[#081B3A] shadow-xs'
                        : 'text-slate-600 hover:text-[#081B3A]'
                    }`}
                  >
                    {dept}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employees by name, role, or ID (e.g. Elena, EMP-3601)..."
              aria-label="Search employees"
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg text-[#081B3A] placeholder:text-slate-400 focus:outline-none focus:border-[#0052FF]"
            />
          </div>

          {/* Data Table or Empty State */}
          {filteredList.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-slate-200 rounded-lg">
              <p className="text-sm font-medium text-[#081B3A]">
                No matching employee 360° records found
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Try clearing your search query or switching the department filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setDepartmentFilter('All');
                }}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0052FF] bg-[#0052FF]/10 rounded-lg hover:bg-[#0052FF]/15 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Directory Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                    <th className="py-2.5 pr-4">Employee</th>
                    <th className="py-2.5 px-3">Department &amp; Location</th>
                    <th className="py-2.5 px-3 text-right">360° Score</th>
                    <th className="py-2.5 pl-3 text-right">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredList.map((emp) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${config.deepNavy}, ${config.electricBlue})`,
                            }}
                          >
                            {emp.initials}
                          </div>
                          <div>
                            <div className="font-semibold text-[#081B3A]">
                              {emp.name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {emp.id} · {emp.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <span>{emp.department}</span>
                        <span aria-hidden="true" className="mx-1.5">
                          ·
                        </span>
                        <span className="text-slate-500">{emp.location}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-[#081B3A] tabular-nums">
                        {emp.review360Score.toFixed(1)} / 5.0
                      </td>
                      <td className="py-3 pl-3 text-right font-mono text-emerald-700 tabular-nums">
                        {emp.attendanceRate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Employee 360° Record Form */}
        <form
          onSubmit={handleAddEmployee}
          className="bg-white border border-slate-200 rounded-xl p-6"
          noValidate
        >
          <h4
            className="text-sm font-semibold text-[#081B3A] mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Enroll New Employee in OFC360 Cycle
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            Add a team member directly to verify live state synchronization in the OFC360 mobile app.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="emp-name-input"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Full Name
              </label>
              <input
                id="emp-name-input"
                type="text"
                value={newEmpName}
                onChange={(e) => setNewEmpName(e.target.value)}
                placeholder="e.g. Liam Vance"
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg text-[#081B3A] focus:outline-none focus:border-[#0052FF]"
              />
            </div>

            <div>
              <label
                htmlFor="emp-role-input"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Role Title
              </label>
              <input
                id="emp-role-input"
                type="text"
                value={newEmpRole}
                onChange={(e) => setNewEmpRole(e.target.value)}
                placeholder="e.g. Staff Payroll Analyst"
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg text-[#081B3A] focus:outline-none focus:border-[#0052FF]"
              />
            </div>

            <div>
              <label
                htmlFor="emp-dept-select"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Department
              </label>
              <select
                id="emp-dept-select"
                value={newEmpDept}
                onChange={(e) =>
                  setNewEmpDept(e.target.value as Employee360Record['department'])
                }
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg text-[#081B3A] focus:outline-none focus:border-[#0052FF]"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="People Ops">People Ops</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
          </div>

          {formError && (
            <p
              role="alert"
              className="text-xs text-rose-600 font-medium mt-2.5"
            >
              {formError}
            </p>
          )}

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#081B3A] hover:bg-[#0052FF] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add to OFC360 Directory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
