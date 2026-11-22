'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import {
  useAddWorkforceEmployeeMutation,
  usePublishAnnouncementMutation,
} from '@/lib/store/hr-api';
import {
  addEmployeeFormSchema,
  announcementFormSchema,
  AnnouncementItem,
  AnnouncementPriority,
  WORKFORCE_EMPLOYEE_ROLES,
  WorkforceEmployeeRole,
} from '@/lib/hr-dashboard-logic';

interface AddEmployeeModalProps {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

const DEPARTMENTS = [
  'Engineering',
  'Product & Design',
  'Sales & Growth',
  'People Operations',
  'Finance & Legal',
  'Customer Success',
];

const SHIFTS = [
  'General Shift (09:30 - 18:30)',
  'Morning Shift (06:00 - 15:00)',
  'Night Shift (21:00 - 06:00)',
  'Flexible Shift',
];

export function AddEmployeeModal({
  visible,
  onClose,
  onSuccessToast,
}: AddEmployeeModalProps) {
  const [addEmployee, { isLoading }] = useAddWorkforceEmployeeMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [role, setRole] = useState<WorkforceEmployeeRole>('Employee');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Bengaluru · Global HQ');
  const [shift, setShift] = useState(SHIFTS[0]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!visible) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const parsed = addEmployeeFormSchema.safeParse({
      name,
      email,
      phone,
      designation,
      role,
      department,
      location,
      shift,
    });

    if (!parsed.success) {
      const firstErr =
        parsed.error.issues[0]?.message || 'Please check all required fields.';
      setErrorMsg(firstErr);
      return;
    }

    try {
      await addEmployee(parsed.data).unwrap();
      onSuccessToast(
        `${parsed.data.name} (${parsed.data.role}) onboarded to ${parsed.data.department}`
      );
      setName('');
      setEmail('');
      setPhone('');
      setDesignation('');
      setRole('Employee');
      onClose();
    } catch {
      setErrorMsg('Failed to onboard employee. Please try again.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Onboard workforce employee"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/45 md:p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSave}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[540px] bg-white rounded-t-lg md:rounded-lg border border-[#E5E7EB] overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 h-14 shrink-0">
          <div>
            <h2 className="text-[16px] font-semibold text-[#171717]">
              Add employee
            </h2>
            <p className="text-[12px] text-[#666666]">
              Create a new employee profile in OFC360
            </p>
          </div>
          <button
            type="button"
            aria-label="Close add employee dialog"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md text-[#404040] hover:bg-[#F3F2EF] cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4 space-y-3.5">
          {errorMsg ? (
            <div
              role="alert"
              className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[12px] font-medium text-[#B91C1C]"
            >
              {errorMsg}
            </div>
          ) : null}

          <div>
            <label htmlFor="add-emp-name" className="block text-[12px] font-medium text-[#404040] mb-1">
              Full name *
            </label>
            <input
              id="add-emp-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] placeholder:text-[#666666] focus:border-[#0A66C2] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="add-emp-email" className="block text-[12px] font-medium text-[#404040] mb-1">
              Work email *
            </label>
            <input
              id="add-emp-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] placeholder:text-[#666666] focus:border-[#0A66C2] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="add-emp-phone" className="block text-[12px] font-medium text-[#404040] mb-1">
                Mobile phone *
              </label>
              <input
                id="add-emp-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98201 11223"
                className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] tabular-nums placeholder:text-[#666666] focus:border-[#0A66C2] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="add-emp-designation" className="block text-[12px] font-medium text-[#404040] mb-1">
                Designation *
              </label>
              <input
                id="add-emp-designation"
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Senior Engineer"
                className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] placeholder:text-[#666666] focus:border-[#0A66C2] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <span className="block text-[12px] font-medium text-[#404040] mb-1.5">
              Role *
            </span>
            <div className="flex flex-wrap gap-2">
              {WORKFORCE_EMPLOYEE_ROLES.map((r) => {
                const active = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    aria-label={`Role ${r}`}
                    onClick={() => setRole(r)}
                    className={`h-9 rounded-md border px-3 text-[12px] font-medium transition-colors cursor-pointer ${
                      active
                        ? 'border-[#0A66C2] bg-[#EFF6FF] text-[#0A66C2] font-semibold'
                        : 'border-[#E5E7EB] bg-white text-[#666666] hover:bg-[#F3F2EF]'
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="add-emp-dept" className="block text-[12px] font-medium text-[#404040] mb-1">
                Department
              </label>
              <select
                id="add-emp-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#171717] focus:border-[#0A66C2] focus:outline-none"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="add-emp-shift" className="block text-[12px] font-medium text-[#404040] mb-1">
                Assigned shift
              </label>
              <select
                id="add-emp-shift"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#171717] focus:border-[#0A66C2] focus:outline-none"
              >
                {SHIFTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="add-emp-location" className="block text-[12px] font-medium text-[#404040] mb-1">
              Office location *
            </label>
            <input
              id="add-emp-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Bengaluru · Global HQ"
              className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] placeholder:text-[#666666] focus:border-[#0A66C2] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] px-4 py-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-[#E5E7EB] bg-white px-4 text-[13px] font-medium text-[#171717] hover:bg-[#F3F2EF] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="h-9 rounded-md bg-[#0A66C2] px-4 text-[13px] font-semibold text-white hover:bg-[#004182] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Onboarding...' : 'Add employee'}
          </button>
        </div>
      </form>
    </div>
  );
}

interface AnnouncementModalProps {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

const CATEGORIES: AnnouncementItem['category'][] = [
  'Company News',
  'Policy Update',
  'Payroll & Benefits',
  'Events',
  'IT & Security',
];

const PRIORITIES: AnnouncementPriority[] = ['Normal', 'High', 'Urgent'];

export function AnnouncementModal({
  visible,
  onClose,
  onSuccessToast,
}: AnnouncementModalProps) {
  const [publishAnnouncement, { isLoading }] = usePublishAnnouncementMutation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('High');
  const [category, setCategory] =
    useState<AnnouncementItem['category']>('Company News');
  const [department, setDepartment] = useState('All Departments');
  const [targetAudience, setTargetAudience] = useState('All Employees');
  const [expiryDate, setExpiryDate] = useState(
    `${new Date().getFullYear()}-12-31`
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!visible) return null;

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const parsed = announcementFormSchema.safeParse({
      title,
      description,
      priority,
      category,
      targetAudience,
      department,
      expiryDate,
    });

    if (!parsed.success) {
      setErrorMsg(
        parsed.error.issues[0]?.message || 'Please check announcement fields.'
      );
      return;
    }

    try {
      await publishAnnouncement({
        ...parsed.data,
        status: 'Published',
      }).unwrap();
      onSuccessToast('Notice published');
      setTitle('');
      setDescription('');
      onClose();
    } catch {
      setErrorMsg('Failed to broadcast announcement.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Broadcast enterprise notice"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/45 md:p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handlePublish}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[540px] bg-white rounded-t-lg md:rounded-lg border border-[#E5E7EB] overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 h-14 shrink-0">
          <div>
            <h2 className="text-[16px] font-semibold text-[#171717]">
              Broadcast notice
            </h2>
            <p className="text-[12px] text-[#666666]">
              Send an official update to employees
            </p>
          </div>
          <button
            type="button"
            aria-label="Close notice dialog"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md text-[#404040] hover:bg-[#F3F2EF] cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4 space-y-3.5">
          {errorMsg ? (
            <div
              role="alert"
              className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[12px] font-medium text-[#B91C1C]"
            >
              {errorMsg}
            </div>
          ) : null}

          <div>
            <label htmlFor="notice-title" className="block text-[12px] font-medium text-[#404040] mb-1">
              Notice title *
            </label>
            <input
              id="notice-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Quarterly townhall schedule"
              className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] placeholder:text-[#666666] focus:border-[#0A66C2] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="block text-[12px] font-medium text-[#404040] mb-1.5">
                Priority
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {PRIORITIES.map((p) => {
                  const active = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`h-9 rounded-md border text-[12px] font-medium transition-colors cursor-pointer ${
                        active
                          ? 'border-[#0A66C2] bg-[#EFF6FF] text-[#0A66C2] font-semibold'
                          : 'border-[#E5E7EB] bg-white text-[#666666] hover:bg-[#F3F2EF]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="notice-category" className="block text-[12px] font-medium text-[#404040] mb-1.5">
                Category
              </label>
              <select
                id="notice-category"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as AnnouncementItem['category'])
                }
                className="h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#171717] focus:border-[#0A66C2] focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="notice-dept" className="block text-[12px] font-medium text-[#404040] mb-1">
                Department
              </label>
              <input
                id="notice-dept"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] focus:border-[#0A66C2] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="notice-expiry" className="block text-[12px] font-medium text-[#404040] mb-1">
                Expiry date
              </label>
              <input
                id="notice-expiry"
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="YYYY-MM-DD"
                className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] tabular-nums focus:border-[#0A66C2] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notice-audience" className="block text-[12px] font-medium text-[#404040] mb-1">
              Target audience
            </label>
            <input
              id="notice-audience"
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] focus:border-[#0A66C2] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="notice-body" className="block text-[12px] font-medium text-[#404040] mb-1">
              Message details *
            </label>
            <textarea
              id="notice-body"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write the official notice message..."
              className="w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-[13px] text-[#171717] placeholder:text-[#666666] focus:border-[#0A66C2] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] px-4 py-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-[#E5E7EB] bg-white px-4 text-[13px] font-medium text-[#171717] hover:bg-[#F3F2EF] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="h-9 rounded-md bg-[#0A66C2] px-4 text-[13px] font-semibold text-white hover:bg-[#004182] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Publishing...' : 'Publish notice'}
          </button>
        </div>
      </form>
    </div>
  );
}
