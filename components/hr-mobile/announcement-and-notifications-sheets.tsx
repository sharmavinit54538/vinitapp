'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  announcementFormSchema,
  AnnouncementFormValues,
  addEmployeeFormSchema,
  AddEmployeeFormValues,
  HrNotificationItem,
  NotificationCategory,
  BottomNavTab,
} from '@/lib/hr-dashboard-logic';
import {
  usePublishAnnouncementMutation,
  useAddWorkforceEmployeeMutation,
  useMarkNotificationsReadMutation,
} from '@/lib/store/hr-api';
import {
  X,
  Megaphone,
  Eye,
  Send,
  FileText,
  Bell,
  CheckCheck,
  UserPlus,
  Loader2,
  Calendar,
  Building2,
  Users,
} from 'lucide-react';

interface AnnouncementBottomSheetProps {
  open: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
  canEdit: boolean;
}

export function AnnouncementBottomSheet({
  open,
  onClose,
  onSuccessToast,
  canEdit,
}: AnnouncementBottomSheetProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [publishAnnouncement, { isLoading }] = usePublishAnnouncementMutation();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      priority: 'High',
      category: 'Policy Update',
      targetAudience: 'All Full-Time Employees',
      department: 'All Departments',
      expiryDate: '2026-12-15',
    },
  });

  if (!open) return null;

  const watchedValues = watch();

  const handlePublishOrDraft = async (
    values: AnnouncementFormValues,
    status: 'Published' | 'Draft'
  ) => {
    if (!canEdit) return;
    try {
      const res = await publishAnnouncement({
        ...values,
        status,
      }).unwrap();
      onSuccessToast(res.message);
      reset();
      setIsPreviewMode(false);
      onClose();
    } catch {
      onSuccessToast('Unable to save announcement. Please check your inputs.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-sheet-title"
      data-testid="announcement-bottom-sheet"
    >
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Native Drag Handle */}
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Sheet Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Megaphone className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3
                id="announcement-sheet-title"
                className="text-base font-bold text-slate-900 dark:text-white leading-tight"
              >
                {isPreviewMode ? 'Preview Announcement' : 'Broadcast Announcement'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instant push &amp; feed broadcast across OFC360 mobile
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close announcement sheet"
            className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sheet Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {isPreviewMode ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  {watchedValues.category} · {watchedValues.priority} Priority
                </span>
                <span className="font-mono tabular-nums">
                  Expires {watchedValues.expiryDate}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {watchedValues.title || 'Untitled Announcement'}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {watchedValues.description || 'No description entered yet.'}
              </p>
              <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Target: {watchedValues.targetAudience}</span>
                <span>·</span>
                <span>Dept: {watchedValues.department}</span>
              </div>
            </div>
          ) : (
            <form
              id="announcement-create-form"
              onSubmit={handleSubmit((vals) =>
                handlePublishOrDraft(vals, 'Published')
              )}
              className="space-y-4"
              noValidate
            >
              <div>
                <label
                  htmlFor="ann-title"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Announcement Title
                </label>
                <input
                  id="ann-title"
                  type="text"
                  placeholder="e.g. Q4 Townhall & Annual Bonus Schedule"
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="ann-description"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Description / Message
                </label>
                <textarea
                  id="ann-description"
                  rows={3}
                  placeholder="Write clear instructions or policy updates for your workforce..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="ann-priority"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Priority
                  </label>
                  <select
                    id="ann-priority"
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-100"
                    {...register('priority')}
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="ann-category"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Category
                  </label>
                  <select
                    id="ann-category"
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-100"
                    {...register('category')}
                  >
                    <option value="Policy Update">Policy Update</option>
                    <option value="Company News">Company News</option>
                    <option value="Payroll & Benefits">Payroll &amp; Benefits</option>
                    <option value="Events">Events</option>
                    <option value="IT & Security">IT &amp; Security</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="ann-department"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Target Department
                  </label>
                  <select
                    id="ann-department"
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-100"
                    {...register('department')}
                  >
                    <option value="All Departments">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product &amp; Design</option>
                    <option value="People Operations">People Operations</option>
                    <option value="Finance & Legal">Finance &amp; Legal</option>
                    <option value="Enterprise Sales">Enterprise Sales</option>
                    <option value="Customer Success">Customer Success</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="ann-audience"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Target Audience
                  </label>
                  <select
                    id="ann-audience"
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-100"
                    {...register('targetAudience')}
                  >
                    <option value="All Full-Time Employees">All Full-Time Employees</option>
                    <option value="Department Leads & Managers">Department Leads &amp; Managers</option>
                    <option value="Shift Personnel">Shift Personnel</option>
                    <option value="Salaried Workforce">Salaried Workforce</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="ann-expiry"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Expiry Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="ann-expiry"
                    type="date"
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pl-10 pr-3.5 text-sm font-mono text-slate-900 dark:text-slate-100"
                    {...register('expiryDate')}
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Sheet Sticky Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => setIsPreviewMode((p) => !p)}
            className="min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            {isPreviewMode ? 'Edit Fields' : 'Preview'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isLoading || !canEdit}
              onClick={handleSubmit((vals) =>
                handlePublishOrDraft(vals, 'Draft')
              )}
              className="min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Save Draft
            </button>

            <button
              type="submit"
              form="announcement-create-form"
              disabled={isLoading || !canEdit}
              onClick={
                isPreviewMode
                  ? handleSubmit((vals) =>
                      handlePublishOrDraft(vals, 'Published')
                    )
                  : undefined
              }
              data-testid="publish-announcement-submit"
              className="min-h-[44px] px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Publish Announcement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AddEmployeeBottomSheetProps {
  open: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
  canEdit: boolean;
}

export function AddEmployeeBottomSheet({
  open,
  onClose,
  onSuccessToast,
  canEdit,
}: AddEmployeeBottomSheetProps) {
  const [addEmployee, { isLoading }] = useAddWorkforceEmployeeMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddEmployeeFormValues>({
    resolver: zodResolver(addEmployeeFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '+91 98200 11223',
      designation: '',
      department: 'Engineering',
      location: 'Bengaluru · Hybrid',
      shift: 'General Shift',
    },
  });

  if (!open) return null;

  const onSubmit = async (values: AddEmployeeFormValues) => {
    if (!canEdit) return;
    try {
      const res = await addEmployee(values).unwrap();
      onSuccessToast(res.message);
      reset();
      onClose();
    } catch {
      onSuccessToast('Unable to enroll employee. Please verify all fields.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-employee-sheet-title"
      data-testid="add-employee-bottom-sheet"
    >
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden" />

        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UserPlus className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3
                id="add-employee-sheet-title"
                className="text-base font-bold text-slate-900 dark:text-white leading-tight"
              >
                Enroll New Employee
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Creates 360° profile, shift assignment, and SCIM identity
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close enroll employee sheet"
            className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-5 overflow-y-auto space-y-3.5 flex-1"
          noValidate
        >
          <div>
            <label
              htmlFor="emp-sheet-name"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Full Name
            </label>
            <input
              id="emp-sheet-name"
              type="text"
              placeholder="e.g. Kabir Mehta"
              className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 text-sm text-slate-900 dark:text-slate-100"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="emp-sheet-email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Work Email
              </label>
              <input
                id="emp-sheet-email"
                type="email"
                placeholder="kabir.mehta@ofc360.com"
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 text-sm text-slate-900 dark:text-slate-100"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="emp-sheet-phone"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Mobile Number
              </label>
              <input
                id="emp-sheet-phone"
                type="tel"
                placeholder="+91 98200 11223"
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 text-sm font-mono text-slate-900 dark:text-slate-100"
                {...register('phone')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="emp-sheet-designation"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Designation / Role
              </label>
              <input
                id="emp-sheet-designation"
                type="text"
                placeholder="e.g. Senior Backend Engineer"
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 text-sm text-slate-900 dark:text-slate-100"
                {...register('designation')}
              />
              {errors.designation && (
                <p className="text-xs text-rose-600 mt-1">
                  {errors.designation.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="emp-sheet-department"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Department
              </label>
              <select
                id="emp-sheet-department"
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-100"
                {...register('department')}
              >
                <option value="Engineering">Engineering</option>
                <option value="Product & Design">Product &amp; Design</option>
                <option value="People Operations">People Operations</option>
                <option value="Finance & Legal">Finance &amp; Legal</option>
                <option value="Enterprise Sales">Enterprise Sales</option>
                <option value="Customer Success">Customer Success</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="emp-sheet-location"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Work Location
              </label>
              <input
                id="emp-sheet-location"
                type="text"
                placeholder="Bengaluru · Hybrid"
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 text-sm text-slate-900 dark:text-slate-100"
                {...register('location')}
              />
            </div>

            <div>
              <label
                htmlFor="emp-sheet-shift"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Assigned Shift
              </label>
              <select
                id="emp-sheet-shift"
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-100"
                {...register('shift')}
              >
                <option value="General Shift">General Shift (09:30 – 18:30)</option>
                <option value="Morning Shift">Morning Shift (06:30 – 15:30)</option>
                <option value="Night Shift">Night Shift (21:00 – 06:00)</option>
                <option value="Flexible Shift">Flexible Shift (11:00 – 20:00)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !canEdit}
              data-testid="submit-enroll-employee"
              className="min-h-[44px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface NotificationsSheetProps {
  open: boolean;
  onClose: () => void;
  notifications: HrNotificationItem[];
  onNavigateTab: (tab: BottomNavTab) => void;
  onSuccessToast: (msg: string) => void;
}

const NOTIFICATION_CATEGORIES: Array<NotificationCategory | 'All'> = [
  'All',
  'Leave Approvals',
  'Attendance Alerts',
  'Payroll Updates',
  'Recruitment Updates',
  'Company Announcements',
];

export function NotificationsSheet({
  open,
  onClose,
  notifications,
  onNavigateTab,
  onSuccessToast,
}: NotificationsSheetProps) {
  const [selectedCat, setSelectedCat] = useState<NotificationCategory | 'All'>('All');
  const [markRead] = useMarkNotificationsReadMutation();

  if (!open) return null;

  const filtered = notifications.filter(
    (n) => selectedCat === 'All' || n.category === selectedCat
  );
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkSingle = async (item: HrNotificationItem) => {
    if (!item.read) {
      await markRead({ id: item.id });
    }
    if (item.actionTab) {
      onNavigateTab(item.actionTab);
      onClose();
    }
  };

  const handleMarkAll = async () => {
    await markRead({});
    onSuccessToast('All notifications marked as read.');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notifications-sheet-title"
      data-testid="notifications-sheet"
    >
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[88vh] flex flex-col overflow-hidden">
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden" />

        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bell className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3
                id="notifications-sheet-title"
                className="text-base font-bold text-slate-900 dark:text-white leading-tight"
              >
                Notifications Center
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                {unreadCount} unread alerts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="min-h-[40px] px-3 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filter Strip */}
        <div className="px-5 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {NOTIFICATION_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={`min-h-[36px] px-3 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                selectedCat === cat
                  ? 'bg-slate-900 text-white dark:bg-indigo-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No notifications in this category.
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleMarkSingle(item)}
                className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start justify-between gap-3 cursor-pointer ${
                  !item.read ? 'bg-indigo-50/35 dark:bg-indigo-950/20' : ''
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {item.category}
                    </span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">{item.timestamp}</span>
                    {!item.read && (
                      <>
                        <span>·</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          Unread
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
