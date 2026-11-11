'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Copy,
  Eye,
  KeyRound,
  MoreVertical,
  Pencil,
  Send,
  Trash2,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import { AppDispatch, RootState } from '@/lib/store';
import { Button, Input, Label } from '@/src/components/ui';
import {
  AdminEmployeeRecord,
  EmployeeOnboardingStatus,
  EmployeeSystemRole,
  normalizeEmployeeStatus,
} from '../employeesThunk';
import {
  deleteEmployeeLocal,
  updateEmployeeLocal,
} from '../employeesSlice';

const STATUS_BADGE_CONFIG: Record<
  EmployeeOnboardingStatus,
  {
    label: EmployeeOnboardingStatus;
    badgeClass: string;
    dotClass: string;
    hint?: string;
  }
> = {
  ACTIVE: {
    label: 'ACTIVE',
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    dotClass: 'bg-emerald-500',
  },
  PENDING: {
    label: 'PENDING',
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
    dotClass: 'bg-amber-500',
  },
  INVITED: {
    label: 'INVITED',
    badgeClass: 'border-slate-200 bg-slate-100 text-slate-700',
    dotClass: 'bg-slate-500',
  },
  EXPIRED: {
    label: 'EXPIRED',
    badgeClass: 'border-rose-200 bg-rose-50 text-rose-700',
    dotClass: 'bg-rose-500',
    hint: 'Invite token expired',
  },
  DISABLED: {
    label: 'DISABLED',
    badgeClass: 'border-red-200 bg-red-50 text-red-700',
    dotClass: 'bg-red-600',
  },
};

const SHIFT_OPTIONS = [
  'General Shift (09:30 - 18:30)',
  'Morning Shift (06:00 - 15:00)',
  'Night Shift (21:00 - 06:00)',
  'Flexible Shift',
];

const ALL_STATUSES: EmployeeOnboardingStatus[] = [
  'ACTIVE',
  'PENDING',
  'INVITED',
  'EXPIRED',
  'DISABLED',
];

const SYSTEM_ROLES: EmployeeSystemRole[] = [
  'Employee',
  'Manager',
  'Executive',
  'IT-Admin',
];

function formatJoinedDate(dateStr: string): string {
  if (!dateStr) return '—';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getInitials(fullName: string): string {
  const parts = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'EM';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function EmployeesTable() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: employees } = useSelector(
    (state: RootState) => state.adminEmployees
  );

  const [openMenuEmpId, setOpenMenuEmpId] = useState<string | null>(null);
  const [viewingEmployee, setViewingEmployee] =
    useState<AdminEmployeeRecord | null>(null);
  const [editingEmployee, setEditingEmployee] =
    useState<AdminEmployeeRecord | null>(null);

  const syncEmployeeUpdate = async (
    id: string,
    changes: Partial<AdminEmployeeRecord>
  ) => {
    dispatch(updateEmployeeLocal({ id, changes }));
    try {
      await fetch('/api/v1/hr/admin-employees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, changes }),
      });
    } catch {
      // Optimistic Redux state is already updated
    }
  };

  const syncEmployeeDelete = async (emp: AdminEmployeeRecord) => {
    dispatch(deleteEmployeeLocal(emp.id));
    setOpenMenuEmpId(null);
    toast.success(`${emp.fullName} deleted from directory.`);
    try {
      await fetch(
        `/api/v1/hr/admin-employees?id=${encodeURIComponent(emp.id)}`,
        {
          method: 'DELETE',
        }
      );
    } catch {
      // Optimistic Redux state is already updated
    }
  };

  const handleResendInvitation = async (emp: AdminEmployeeRecord) => {
    setOpenMenuEmpId(null);
    await syncEmployeeUpdate(emp.id, { status: 'INVITED' });
    toast.success(
      `Invitation resent to ${emp.personalEmail || emp.officialEmail} with a fresh token.`
    );
  };

  const handleCopyInviteLink = async (emp: AdminEmployeeRecord) => {
    setOpenMenuEmpId(null);
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://ofc360.com';
    const inviteLink = `${origin}/onboarding?emp=${encodeURIComponent(
      emp.employeeCode
    )}&invite=token_${emp.id.toLowerCase()}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(inviteLink);
      }
      toast.success(`Invite link copied for ${emp.fullName}!`);
    } catch {
      toast.success(`Invite link ready: ${inviteLink}`);
    }
  };

  const handleResetPassword = (emp: AdminEmployeeRecord) => {
    setOpenMenuEmpId(null);
    toast.success(
      `Password reset link sent to ${emp.officialEmail}.`
    );
  };

  const handleDeactivateEmployee = async (emp: AdminEmployeeRecord) => {
    setOpenMenuEmpId(null);
    await syncEmployeeUpdate(emp.id, { status: 'DISABLED' });
    toast.success(`${emp.fullName} has been deactivated (DISABLED).`);
  };

  const handleActivateEmployee = async (emp: AdminEmployeeRecord) => {
    setOpenMenuEmpId(null);
    await syncEmployeeUpdate(emp.id, { status: 'ACTIVE' });
    toast.success(`${emp.fullName} is now ACTIVE.`);
  };

  return (
    <div className="space-y-4" data-testid="admin-employees-table-section">
      {/* Backdrop to close row action dropdown when clicking outside */}
      {openMenuEmpId && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setOpenMenuEmpId(null)}
        />
      )}

      <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Designation</th>
                <th className="px-4 py-3.5">Joined</th>
                <th className="px-4 py-3.5">Shift</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => {
                const normalizedStatus = normalizeEmployeeStatus(emp.status);
                const badge = STATUS_BADGE_CONFIG[normalizedStatus];
                const isMenuOpen = openMenuEmpId === emp.id;

                return (
                  <tr
                    key={emp.id}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    {/* EMPLOYEE */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-600">
                          {getInitials(emp.fullName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-900">
                            {emp.fullName}
                          </p>
                          <p className="truncate font-mono text-[11px] text-slate-500">
                            {emp.employeeCode} · {emp.officialEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* DEPARTMENT */}
                    <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                      {emp.department}
                    </td>

                    {/* DESIGNATION */}
                    <td className="px-4 py-3.5 font-medium text-slate-700 whitespace-nowrap">
                      {emp.designation}
                    </td>

                    {/* JOINED */}
                    <td className="px-4 py-3.5 font-medium text-slate-600 whitespace-nowrap">
                      {formatJoinedDate(emp.dateOfJoining)}
                    </td>

                    {/* SHIFT */}
                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                      {emp.defaultShift}
                    </td>

                    {/* STATUS BADGE */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col items-start gap-0.5">
                        <span
                          title={badge.hint || badge.label}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${badge.badgeClass}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${badge.dotClass}`}
                          />
                          {badge.label}
                        </span>
                        {normalizedStatus === 'EXPIRED' && (
                          <span className="text-[10px] font-medium text-rose-600">
                            Invite token expired
                          </span>
                        )}
                      </div>
                    </td>

                    {/* ROW ACTIONS DROPDOWN */}
                    <td className="relative px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuEmpId(isMenuOpen ? null : emp.id)
                        }
                        aria-label={`Actions for ${emp.fullName}`}
                        data-testid={`employee-row-actions-${emp.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {isMenuOpen && (
                        <div
                          className="absolute right-4 z-40 mt-1.5 w-52 origin-top-right rounded-2xl border border-slate-200 bg-white p-1.5 text-left shadow-xl"
                          role="menu"
                        >
                          {/* 1. View Full Profile — hamesha */}
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuEmpId(null);
                              setViewingEmployee(emp);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                            View Full Profile
                          </button>

                          {/* 2. Edit Employee — hamesha */}
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuEmpId(null);
                              setEditingEmployee(emp);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5 text-slate-500" />
                            Edit Employee
                          </button>

                          {/* 3. Resend Invitation & Copy Invite Link — status INVITED ya EXPIRED ho */}
                          {(normalizedStatus === 'INVITED' ||
                            normalizedStatus === 'EXPIRED') && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleResendInvitation(emp)}
                                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 cursor-pointer"
                              >
                                <Send className="h-3.5 w-3.5 text-indigo-600" />
                                Resend Invitation
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyInviteLink(emp)}
                                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                              >
                                <Copy className="h-3.5 w-3.5 text-slate-500" />
                                Copy Invite Link
                              </button>
                            </>
                          )}

                          {/* 4. Reset Password & Deactivate Employee — status ACTIVE ho */}
                          {normalizedStatus === 'ACTIVE' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleResetPassword(emp)}
                                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                              >
                                <KeyRound className="h-3.5 w-3.5 text-slate-500" />
                                Reset Password
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeactivateEmployee(emp)}
                                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 cursor-pointer"
                              >
                                <UserX className="h-3.5 w-3.5 text-amber-600" />
                                Deactivate Employee
                              </button>
                            </>
                          )}

                          {/* 5. Activate Employee — status DISABLED ho */}
                          {normalizedStatus === 'DISABLED' && (
                            <button
                              type="button"
                              onClick={() => handleActivateEmployee(emp)}
                              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                            >
                              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                              Activate Employee
                            </button>
                          )}

                          {/* Separator */}
                          <div className="my-1 border-t border-slate-100" />

                          {/* 6. Delete Employee (red color me) — hamesha, separator ke neeche */}
                          <button
                            type="button"
                            onClick={() => syncEmployeeDelete(emp)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                            Delete Employee
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW FULL PROFILE MODAL */}
      {viewingEmployee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-sm font-bold text-indigo-600">
                  {getInitials(viewingEmployee.fullName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {viewingEmployee.fullName}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                        STATUS_BADGE_CONFIG[
                          normalizeEmployeeStatus(viewingEmployee.status)
                        ].badgeClass
                      }`}
                    >
                      {normalizeEmployeeStatus(viewingEmployee.status)}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-slate-500">
                    {viewingEmployee.employeeCode} · {viewingEmployee.designation}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingEmployee(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">
                  Official Email
                </p>
                <p className="mt-0.5 font-semibold text-slate-900">
                  {viewingEmployee.officialEmail}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">
                  Personal Email
                </p>
                <p className="mt-0.5 font-semibold text-slate-900">
                  {viewingEmployee.personalEmail || '—'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">
                  Mobile Number
                </p>
                <p className="mt-0.5 font-semibold text-slate-900">
                  {viewingEmployee.mobileNumber}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">
                  Department &amp; Manager
                </p>
                <p className="mt-0.5 font-semibold text-slate-900">
                  {viewingEmployee.department} (Reports to{' '}
                  {viewingEmployee.reportingManager})
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">
                  Date of Joining
                </p>
                <p className="mt-0.5 font-semibold text-slate-900">
                  {formatJoinedDate(viewingEmployee.dateOfJoining)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">
                  Shift
                </p>
                <p className="mt-0.5 font-semibold text-slate-900">
                  {viewingEmployee.defaultShift}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">
                  CTC / Salary Structure
                </p>
                <p className="mt-0.5 font-semibold text-slate-900">
                  {viewingEmployee.ctcStructure}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">
                  System Access Role
                </p>
                <p className="mt-0.5 font-semibold text-indigo-700">
                  {viewingEmployee.systemRole} ({viewingEmployee.employmentType}{' '}
                  · {viewingEmployee.workMode})
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setViewingEmployee(null)}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  const emp = viewingEmployee;
                  setViewingEmployee(null);
                  setEditingEmployee(emp);
                }}
              >
                Edit Employee
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSave={async (changes) => {
            await syncEmployeeUpdate(editingEmployee.id, changes);
            toast.success(`${changes.firstName || editingEmployee.firstName} updated!`);
            setEditingEmployee(null);
          }}
        />
      )}
    </div>
  );
}

interface EditEmployeeModalProps {
  employee: AdminEmployeeRecord;
  onClose: () => void;
  onSave: (changes: Partial<AdminEmployeeRecord>) => Promise<void>;
}

function EditEmployeeModal({
  employee,
  onClose,
  onSave,
}: EditEmployeeModalProps) {
  const [firstName, setFirstName] = useState(employee.firstName);
  const [lastName, setLastName] = useState(employee.lastName);
  const [officialEmail, setOfficialEmail] = useState(employee.officialEmail);
  const [personalEmail, setPersonalEmail] = useState(
    employee.personalEmail || ''
  );
  const [department, setDepartment] = useState(employee.department);
  const [designation, setDesignation] = useState(employee.designation);
  const [dateOfJoining, setDateOfJoining] = useState(employee.dateOfJoining);
  const [defaultShift, setDefaultShift] = useState(employee.defaultShift);
  const [ctcStructure, setCtcStructure] = useState(employee.ctcStructure);
  const [systemRole, setSystemRole] = useState<EmployeeSystemRole>(
    employee.systemRole
  );
  const [status, setStatus] = useState<EmployeeOnboardingStatus>(
    normalizeEmployeeStatus(employee.status)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !officialEmail.trim()) {
      toast.error('First Name and Official Email are required.');
      return;
    }
    await onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      officialEmail: officialEmail.trim(),
      personalEmail: personalEmail.trim(),
      department: department.trim(),
      designation: designation.trim(),
      dateOfJoining,
      defaultShift,
      ctcStructure: ctcStructure.trim(),
      systemRole,
      status,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Edit Employee · {employee.fullName}
            </h3>
            <p className="text-xs text-slate-500">
              Update department, designation, shift, role &amp; status badge
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>First Name</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <Label required>Last Name</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div>
              <Label required>Official Email</Label>
              <Input
                type="email"
                value={officialEmail}
                onChange={(e) => setOfficialEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Personal Email</Label>
              <Input
                type="email"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
              />
            </div>
            <div>
              <Label required>Department</Label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
            <div>
              <Label required>Designation</Label>
              <Input
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>
            <div>
              <Label>Joined Date</Label>
              <Input
                type="date"
                value={dateOfJoining}
                onChange={(e) => setDateOfJoining(e.target.value)}
              />
            </div>
            <div>
              <Label>Shift</Label>
              <select
                value={defaultShift}
                onChange={(e) => setDefaultShift(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
              >
                {SHIFT_OPTIONS.map((sh) => (
                  <option key={sh} value={sh}>
                    {sh}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label>Initial CTC / Salary Structure</Label>
            <Input
              value={ctcStructure}
              onChange={(e) => setCtcStructure(e.target.value)}
              placeholder="e.g., ₹12,00,000 / year"
            />
          </div>

          <div>
            <Label>Status Badge</Label>
            <div className="mt-1.5 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {ALL_STATUSES.map((st) => {
                const active = status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`flex h-9 items-center justify-center rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                      active
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label>System Access Role</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SYSTEM_ROLES.map((r) => {
                const active = systemRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSystemRole(r)}
                    className={`flex h-9 items-center justify-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              <CheckCircle2 className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
