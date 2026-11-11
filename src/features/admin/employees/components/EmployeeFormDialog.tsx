'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Briefcase,
  Loader2,
  MailCheck,
  ShieldCheck,
  UserPlus,
  Wallet,
  X,
} from 'lucide-react';
import { Button, Input, Label } from '@/src/components/ui';
import {
  adminEmployeeFormSchema,
  AdminEmployeeFormValues,
  EmployeeSystemRole,
  EmploymentTypeOption,
  GenderOption,
  WorkModeOption,
} from '../employeesThunk';

export interface EmployeeFormDialogProps {
  open: boolean;
  onClose: () => void;
  departmentOptions: string[];
  managerOptions: string[];
  nextEmployeeCode: string;
  isSubmitting: boolean;
  onSubmitEmployee: (payload: AdminEmployeeFormValues) => Promise<void>;
}

type EmployeeFormTab =
  | 'personal'
  | 'organization'
  | 'classification'
  | 'compensation';

const SALARY_STRUCTURES = [
  'Standard Tech Band A (₹12L – ₹18L)',
  'Senior Band B (₹18L – ₹30L)',
  'Leadership Band C (₹30L+)',
  'Operations & G&A Band (₹8L – ₹14L)',
  'Intern / Stipend Structure (₹4.8L)',
];

const SHIFT_OPTIONS = [
  'General Shift (09:30 - 18:30)',
  'Morning Shift (06:00 - 15:00)',
  'Night Shift (21:00 - 06:00)',
  'Flexible Shift',
];

const SYSTEM_ROLES: EmployeeSystemRole[] = [
  'Employee',
  'Manager',
  'Executive',
  'IT-Admin',
];

export function EmployeeFormDialog({
  open,
  onClose,
  departmentOptions,
  managerOptions,
  nextEmployeeCode,
  isSubmitting,
  onSubmitEmployee,
}: EmployeeFormDialogProps) {
  const [activeTab, setActiveTab] = useState<EmployeeFormTab>('personal');
  const [formValues, setFormValues] = useState<AdminEmployeeFormValues>({
    firstName: '',
    lastName: '',
    officialEmail: '',
    mobileNumber: '+91 98201 11223',
    gender: 'Prefer not to say',
    dateOfBirth: '1996-05-15',
    employeeCode: nextEmployeeCode || 'EMP-3655',
    department: departmentOptions[0] || 'Engineering',
    designation: 'Senior Software Engineer',
    reportingManager: managerOptions[0] || 'Aarav Sharma',
    dateOfJoining: '2026-11-09',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    probationPeriod: '6 months',
    ctcStructure: SALARY_STRUCTURES[0],
    defaultShift: SHIFT_OPTIONS[0],
    systemRole: 'Employee',
    sendOnboardingInvite: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const updateField = <K extends keyof AdminEmployeeFormValues>(
    key: K,
    val: AdminEmployeeFormValues[K]
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: val,
    }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = adminEmployeeFormSchema.safeParse(formValues);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] || '');
        if (key && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      toast.error(
        parsed.error.issues[0]?.message ||
          'Please check required employee fields.'
      );
      return;
    }

    try {
      await onSubmitEmployee(parsed.data);
      const inviteNotice = parsed.data.sendOnboardingInvite
        ? ' & self-onboarding invite sent'
        : '';
      toast.success(
        `${parsed.data.firstName} ${parsed.data.lastName} (${parsed.data.systemRole}) added${inviteNotice}!`
      );
      setErrors({});
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to enroll employee'
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-employee-dialog-title"
      data-testid="employee-form-dialog"
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="add-employee-dialog-title"
                className="text-sm font-bold text-slate-900"
              >
                Add Workforce Employee (360° Onboarding &amp; Role Provisioning)
              </h3>
              <p className="text-xs text-slate-500">
                Personal details, org assignment, employment classification,
                CTC &amp; system role
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Add Employee dialog"
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="mt-4 grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1 sm:grid-cols-4">
          {[
            { id: 'personal', label: '1. Personal Details' },
            { id: 'organization', label: '2. Job & Org' },
            { id: 'classification', label: '3. Classification' },
            { id: 'compensation', label: '4. CTC & Role' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as EmployeeFormTab)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
          {/* 1. Personal Details */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <Label htmlFor="emp-first-name" required>
                First Name
              </Label>
              <Input
                id="emp-first-name"
                placeholder="e.g., Kabir"
                value={formValues.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                error={errors.firstName}
              />
            </div>

            <div>
              <Label htmlFor="emp-last-name" required>
                Last Name
              </Label>
              <Input
                id="emp-last-name"
                placeholder="e.g., Mehta"
                value={formValues.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                error={errors.lastName}
              />
            </div>

            <div>
              <Label htmlFor="emp-official-email" required>
                Official Email
              </Label>
              <Input
                id="emp-official-email"
                type="email"
                placeholder="kabir.mehta@ofc360.com"
                value={formValues.officialEmail}
                onChange={(e) => updateField('officialEmail', e.target.value)}
                error={errors.officialEmail}
              />
            </div>

            <div>
              <Label htmlFor="emp-mobile-number" required>
                Mobile Number
              </Label>
              <Input
                id="emp-mobile-number"
                type="tel"
                placeholder="+91 98201 11223"
                value={formValues.mobileNumber}
                onChange={(e) => updateField('mobileNumber', e.target.value)}
                error={errors.mobileNumber}
              />
            </div>

            <div>
              <Label htmlFor="emp-gender">Gender</Label>
              <select
                id="emp-gender"
                value={formValues.gender}
                onChange={(e) =>
                  updateField('gender', e.target.value as GenderOption)
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <Label htmlFor="emp-dob">Date of Birth</Label>
              <Input
                id="emp-dob"
                type="date"
                value={formValues.dateOfBirth}
                onChange={(e) => updateField('dateOfBirth', e.target.value)}
              />
            </div>
          </div>

          {/* 2. Job & Organization + 3. Classification */}
          <div className="grid grid-cols-1 gap-3.5 border-t border-slate-100 pt-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="emp-code-input" required>
                Employee ID / Code
              </Label>
              <Input
                id="emp-code-input"
                value={formValues.employeeCode}
                onChange={(e) =>
                  updateField('employeeCode', e.target.value.toUpperCase())
                }
                error={errors.employeeCode}
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="emp-dept-select" required>
                Department
              </Label>
              <select
                id="emp-dept-select"
                value={formValues.department}
                onChange={(e) => updateField('department', e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
              >
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="emp-designation-input" required>
                Designation
              </Label>
              <Input
                id="emp-designation-input"
                placeholder="Senior Software Engineer"
                value={formValues.designation}
                onChange={(e) => updateField('designation', e.target.value)}
                error={errors.designation}
              />
            </div>

            <div>
              <Label htmlFor="emp-manager-select">Reporting Manager</Label>
              <select
                id="emp-manager-select"
                value={formValues.reportingManager}
                onChange={(e) =>
                  updateField('reportingManager', e.target.value)
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
              >
                {managerOptions.map((mgr) => (
                  <option key={mgr} value={mgr}>
                    {mgr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="emp-doj-input">Date of Joining</Label>
              <Input
                id="emp-doj-input"
                type="date"
                value={formValues.dateOfJoining}
                onChange={(e) => updateField('dateOfJoining', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="emp-type-select">Employment Type</Label>
              <select
                id="emp-type-select"
                value={formValues.employmentType}
                onChange={(e) =>
                  updateField(
                    'employmentType',
                    e.target.value as EmploymentTypeOption
                  )
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>

            <div>
              <Label htmlFor="emp-workmode-select">Work Mode</Label>
              <select
                id="emp-workmode-select"
                value={formValues.workMode}
                onChange={(e) =>
                  updateField('workMode', e.target.value as WorkModeOption)
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
              >
                <option value="Office">Office (On-Site)</option>
                <option value="Remote">Remote (WFH)</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <Label htmlFor="emp-probation-select">Probation Period</Label>
              <select
                id="emp-probation-select"
                value={formValues.probationPeriod}
                onChange={(e) =>
                  updateField(
                    'probationPeriod',
                    e.target.value as '3 months' | '6 months'
                  )
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
              >
                <option value="3 months">3 months</option>
                <option value="6 months">6 months</option>
              </select>
            </div>

            <div>
              <Label htmlFor="emp-shift-select">Default Shift Assignment</Label>
              <select
                id="emp-shift-select"
                value={formValues.defaultShift}
                onChange={(e) => updateField('defaultShift', e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
              >
                {SHIFT_OPTIONS.map((sh) => (
                  <option key={sh} value={sh}>
                    {sh}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Compensation & System Access Role */}
          <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="emp-ctc-select">
                Initial CTC / Salary Structure
              </Label>
              <select
                id="emp-ctc-select"
                value={formValues.ctcStructure}
                onChange={(e) => updateField('ctcStructure', e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
              >
                {SALARY_STRUCTURES.map((band) => (
                  <option key={band} value={band}>
                    {band}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label required>System Access Role</Label>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {SYSTEM_ROLES.map((roleOpt) => (
                  <button
                    key={roleOpt}
                    type="button"
                    onClick={() => updateField('systemRole', roleOpt)}
                    className={`rounded-xl border px-2.5 py-2 text-xs font-bold transition-all ${
                      formValues.systemRole === roleOpt
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {roleOpt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Onboarding Invite Trigger Checkbox */}
          <label
            htmlFor="send-onboarding-invite-checkbox"
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50/60 p-3.5"
          >
            <input
              id="send-onboarding-invite-checkbox"
              type="checkbox"
              checked={formValues.sendOnboardingInvite}
              onChange={(e) =>
                updateField('sendOnboardingInvite', e.target.checked)
              }
              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
            <div className="flex-1">
              <p className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                <MailCheck className="h-4 w-4 text-indigo-600" />
                Send self-onboarding invite link to employee email upon creation
              </p>
              <p className="text-[11px] text-indigo-700">
                Automatically dispatches magic-link activation and pre-boarding
                document upload checklist to {formValues.officialEmail || 'employee email'}.
              </p>
            </div>
          </label>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              data-testid="submit-admin-employee-btn"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                'Create Employee Profile'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
