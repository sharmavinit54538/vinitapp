'use client';

import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FileSpreadsheet,
  MailCheck,
  Search,
  UserPlus,
} from 'lucide-react';
import { AppDispatch, RootState } from '@/lib/store';
import { Button, Input } from '@/src/components/ui';
import {
  AdminEmployeeFormValues,
  bulkImportAdminEmployeesThunk,
  createAdminEmployeeThunk,
} from '../employeesThunk';
import { EmployeeFormDialog } from './EmployeeFormDialog';
import { EmployeeBulkImportDialog } from './EmployeeBulkImportDialog';

export function EmployeesTable() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: employees, submitting } = useSelector(
    (state: RootState) => state.adminEmployees
  );
  const { items: departments } = useSelector(
    (state: RootState) => state.adminDepartments
  );

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const departmentOptions = useMemo(() => {
    const names = departments.map((d) => d.name);
    return names.length > 0
      ? names
      : ['Engineering', 'People Operations', 'Finance & Legal', 'Sales'];
  }, [departments]);

  const managerOptions = useMemo(() => {
    const mgrs = employees.map((e) => e.fullName);
    return mgrs.length > 0 ? mgrs : ['Aarav Sharma', 'Rohan Verma'];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((emp) => {
      const matchesRole =
        roleFilter === 'All' || emp.systemRole === roleFilter;
      const matchesDept =
        deptFilter === 'All' || emp.department === deptFilter;
      const matchesSearch =
        !q ||
        emp.fullName.toLowerCase().includes(q) ||
        emp.employeeCode.toLowerCase().includes(q) ||
        emp.officialEmail.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q) ||
        emp.systemRole.toLowerCase().includes(q);
      return matchesRole && matchesDept && matchesSearch;
    });
  }, [employees, search, roleFilter, deptFilter]);

  const handleCreateEmployee = async (payload: AdminEmployeeFormValues) => {
    await dispatch(createAdminEmployeeThunk(payload)).unwrap();
  };

  const handleBulkImport = async (rows: AdminEmployeeFormValues[]) => {
    await dispatch(bulkImportAdminEmployeesThunk(rows)).unwrap();
  };

  return (
    <div className="space-y-4" data-testid="admin-employees-table-section">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Workforce Employees Directory ({employees.length})
          </h3>
          <p className="text-xs text-slate-500">
            360° employee records with System Access Role (Employee, Manager,
            Executive, IT-Admin), CTC &amp; onboarding invite status
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-52">
            <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search name, ID, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            aria-label="Filter by System Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700"
          >
            <option value="All">All Roles</option>
            <option value="Employee">Employee</option>
            <option value="Manager">Manager</option>
            <option value="Executive">Executive</option>
            <option value="IT-Admin">IT-Admin</option>
          </select>

          <select
            aria-label="Filter by Department"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700"
          >
            <option value="All">All Departments</option>
            {departmentOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <Button
            type="button"
            variant="outline"
            onClick={() => setIsBulkOpen(true)}
            data-testid="open-emp-bulk-import-btn"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Bulk Import CSV
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => setIsAddOpen(true)}
            data-testid="open-add-employee-dialog-btn"
          >
            <UserPlus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Department &amp; Manager</th>
              <th className="px-4 py-3">Classification</th>
              <th className="px-4 py-3">CTC &amp; Shift</th>
              <th className="px-4 py-3">Onboarding Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3">
                  <p className="font-bold text-slate-900">{emp.fullName}</p>
                  <p className="font-mono text-[11px] text-slate-500">
                    {emp.employeeCode} · {emp.officialEmail}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
                    {emp.systemRole}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-800">
                    {emp.department} · {emp.designation}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Reports to: {emp.reportingManager}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">
                    {emp.employmentType} · {emp.workMode}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Probation: {emp.probationPeriod}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">
                    {emp.ctcStructure}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {emp.defaultShift}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    {emp.sendOnboardingInvite && (
                      <MailCheck className="h-3.5 w-3.5" />
                    )}
                    {emp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EmployeeFormDialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        departmentOptions={departmentOptions}
        managerOptions={managerOptions}
        nextEmployeeCode={`EMP-${100 + employees.length + 1}`}
        isSubmitting={submitting}
        onSubmitEmployee={handleCreateEmployee}
      />

      <EmployeeBulkImportDialog
        open={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        isSubmitting={submitting}
        onBulkImport={handleBulkImport}
      />
    </div>
  );
}
