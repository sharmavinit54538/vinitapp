'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Briefcase,
  Building2,
  Code2,
  Cpu,
  Loader2,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { Button, Input, Label } from '@/src/components/ui';
import {
  AdminDepartmentRecord,
  CreateDepartmentPayload,
  DepartmentColorTheme,
  DepartmentIconKey,
} from '../departmentsThunk';

export interface DepartmentFormDialogProps {
  open: boolean;
  onClose: () => void;
  existingDepartments: AdminDepartmentRecord[];
  employeeOptions: { id: string; fullName: string; designation: string }[];
  isSubmitting: boolean;
  onSubmitDepartment: (payload: CreateDepartmentPayload) => Promise<void>;
}

const COLOR_THEMES: {
  id: DepartmentColorTheme;
  label: string;
  dotClass: string;
}[] = [
  { id: 'indigo', label: 'Indigo', dotClass: 'bg-indigo-600' },
  { id: 'emerald', label: 'Emerald', dotClass: 'bg-emerald-600' },
  { id: 'amber', label: 'Amber', dotClass: 'bg-amber-500' },
  { id: 'rose', label: 'Rose', dotClass: 'bg-rose-600' },
  { id: 'violet', label: 'Violet', dotClass: 'bg-violet-600' },
  { id: 'sky', label: 'Sky', dotClass: 'bg-sky-600' },
];

const ICON_OPTIONS: {
  id: DepartmentIconKey;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'Code2', label: 'Engineering', Icon: Code2 },
  { id: 'Users', label: 'People / HR', Icon: Users },
  { id: 'Briefcase', label: 'Operations', Icon: Briefcase },
  { id: 'Wallet', label: 'Finance', Icon: Wallet },
  { id: 'Cpu', label: 'IT / Systems', Icon: Cpu },
  { id: 'ShieldCheck', label: 'Compliance', Icon: ShieldCheck },
];

export function DepartmentFormDialog({
  open,
  onClose,
  existingDepartments,
  employeeOptions,
  isSubmitting,
  onSubmitDepartment,
}: DepartmentFormDialogProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [parentDepartmentId, setParentDepartmentId] = useState('');
  const [managerName, setManagerName] = useState(
    employeeOptions[0]?.fullName || 'Aarav Sharma'
  );
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('250000');
  const [headcountLimit, setHeadcountLimit] = useState('25');
  const [colorTheme, setColorTheme] =
    useState<DepartmentColorTheme>('indigo');
  const [iconKey, setIconKey] = useState<DepartmentIconKey>('Code2');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {};
    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedName) {
      nextErrors.name = 'Department Name is required';
    }
    if (!trimmedCode || trimmedCode.length < 2) {
      nextErrors.code = 'Department Code (min 2 chars, e.g. ENG) is required';
    } else {
      const codeCollision = existingDepartments.some(
        (d) => d.code.toUpperCase() === trimmedCode
      );
      if (codeCollision) {
        nextErrors.code = `Department Code "${trimmedCode}" already exists`;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix validation errors before saving.');
      return;
    }

    const parentDept = existingDepartments.find(
      (d) => d.id === parentDepartmentId
    );

    try {
      await onSubmitDepartment({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        parentDepartmentId: parentDept ? parentDept.id : null,
        parentDepartmentName: parentDept ? parentDept.name : null,
        managerName: managerName.trim() || 'Aarav Sharma',
        description:
          description.trim() ||
          `${name.trim()} organizational unit & delivery team`,
        budget: Number(budget) || 0,
        headcountLimit: Number(headcountLimit) || 10,
        colorTheme,
        iconKey,
      });

      toast.success(
        `Department "${name.trim()}" (${code.trim().toUpperCase()}) created!`
      );
      setName('');
      setCode('');
      setParentDepartmentId('');
      setDescription('');
      setErrors({});
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to create department'
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-department-dialog-title"
      data-testid="department-form-dialog"
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="add-department-dialog-title"
                className="text-sm font-bold text-slate-900"
              >
                Add Department
              </h3>
              <p className="text-xs text-slate-500">
                Create an organizational unit with hierarchy, budget &amp;
                headcount limits
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Add Department dialog"
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="dept-form-name" required>
                Department Name
              </Label>
              <Input
                id="dept-form-name"
                placeholder="e.g., Engineering"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
              />
            </div>

            <div>
              <Label htmlFor="dept-form-code" required>
                Department Code (Unique)
              </Label>
              <Input
                id="dept-form-code"
                placeholder="e.g., ENG"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                error={errors.code}
                className="font-mono uppercase"
              />
            </div>

            <div>
              <Label htmlFor="dept-form-parent">
                Parent Department
              </Label>
              <select
                id="dept-form-parent"
                value={parentDepartmentId}
                onChange={(e) => setParentDepartmentId(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
              >
                <option value="">None (Top-Level Department)</option>
                {existingDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="dept-form-manager">
                Department Head / Manager
              </Label>
              <select
                id="dept-form-manager"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
              >
                {employeeOptions.map((emp) => (
                  <option key={emp.id} value={emp.fullName}>
                    {emp.fullName} ({emp.designation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="dept-form-budget">
                Annual Budget Allocation (₹)
              </Label>
              <Input
                id="dept-form-budget"
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dept-form-headcount">
                Approved Headcount Limit
              </Label>
              <Input
                id="dept-form-headcount"
                type="number"
                min={1}
                value={headcountLimit}
                onChange={(e) => setHeadcountLimit(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dept-form-description">
              Description &amp; Charter
            </Label>
            <textarea
              id="dept-form-description"
              rows={2}
              placeholder="Summarize department goals, charter, and key responsibilities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div>
              <Label>Color Theme Tag</Label>
              <div className="mt-1.5 flex items-center gap-3">
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setColorTheme(theme.id)}
                    aria-label={theme.label}
                    title={theme.label}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all cursor-pointer ${
                      colorTheme === theme.id
                        ? 'border-slate-900 bg-slate-900 shadow-xs ring-2 ring-slate-900/15'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`h-4 w-4 shrink-0 rounded-full ${theme.dotClass}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Department Icon</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ICON_OPTIONS.map((item) => {
                  const IconComp = item.Icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIconKey(item.id)}
                      title={item.label}
                      className={`flex h-10 w-full items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        iconKey === item.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <IconComp className="h-3.5 w-3.5 shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              data-testid="submit-department-btn"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Department'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
