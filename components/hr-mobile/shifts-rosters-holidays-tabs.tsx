'use client';

import React, { useState } from 'react';
import {
  ShiftItem,
  RosterEntry,
  HolidayItem,
  HolidayCategory,
  WorkforceEmployee,
  filterRosterEntries,
  filterHolidays,
} from '@/lib/hr-dashboard-logic';
import {
  useSaveShiftMutation,
  useAssignRosterShiftMutation,
  useSaveHolidayMutation,
  useDeleteHolidayMutation,
} from '@/lib/store/hr-api';
import {
  Clock,
  Plus,
  Edit3,
  Users,
  Calendar,
  ArrowLeftRight,
  Trash2,
  X,
  Check,
  Search,
  MapPin,
} from 'lucide-react';

interface ShiftsModuleTabProps {
  shifts: ShiftItem[];
  workforce: WorkforceEmployee[];
  canEdit: boolean;
  onSuccessToast: (msg: string) => void;
}

export function ShiftsModuleTab({
  shifts,
  workforce,
  canEdit,
  onSuccessToast,
}: ShiftsModuleTabProps) {
  const [saveShift, { isLoading }] = useSaveShiftMutation();
  const [editingShift, setEditingShift] = useState<Partial<ShiftItem> | null>(
    null
  );
  const [viewingAssignedShift, setViewingAssignedShift] =
    useState<ShiftItem | null>(null);

  const handleOpenCreate = () => {
    setEditingShift({
      name: '',
      code: 'CS',
      startTime: '08:00 AM',
      endTime: '05:00 PM',
      breakDuration: '45 mins',
      assignedEmployees: 20,
      allowance: '$18 / day',
    });
  };

  const handleSaveShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShift || !editingShift.name?.trim()) return;
    try {
      const res = await saveShift({
        ...editingShift,
        name: editingShift.name.trim(),
      }).unwrap();
      onSuccessToast(res.message);
      setEditingShift(null);
    } catch {
      onSuccessToast('Could not save shift configuration.');
    }
  };

  return (
    <div className="space-y-4" data-testid="shifts-module-tab">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Enterprise Shift Schedules
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure shift timings, break windows, and allowances
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={handleOpenCreate}
            data-testid="create-shift-btn"
            className="min-h-[44px] px-4 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create Shift
          </button>
        )}
      </div>

      {/* Shift Cards Grid */}
      {shifts.length === 0 ? (
        <div className="py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">No shifts configured</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              No enterprise shifts have been added yet. Create standard or flexible shift schedules.
            </p>
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Shift</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              data-testid={`shift-card-${shift.code}`}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3.5 shadow-2xs"
            >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {shift.code}
                  </span>
                  <span>·</span>
                  <span>{shift.status}</span>
                  <span>·</span>
                  <span>Break {shift.breakDuration}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {shift.name}
                </h3>
              </div>

              <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                {shift.allowance}
              </span>
            </div>

            {/* Timings & Assigned Headcount */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">
                  Shift Window
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5 block">
                  {shift.startTime} – {shift.endTime}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">
                  Assigned Staff
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5 block">
                  {shift.assignedEmployees} Employees
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setViewingAssignedShift(shift)}
                className="min-h-[40px] px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                Assigned Staff
              </button>

              {canEdit && (
                <button
                  type="button"
                  onClick={() => setEditingShift(shift)}
                  className="min-h-[40px] px-3 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Timings
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Shift Bottom Sheet */}
      {editingShift && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-xs p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingShift.id ? 'Manage Shift Timings' : 'Create New Shift'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingShift(null)}
                aria-label="Close shift editor"
                className="min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveShiftSubmit} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shift Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingShift.name || ''}
                    onChange={(e) =>
                      setEditingShift({ ...editingShift, name: e.target.value })
                    }
                    placeholder="e.g. EMEA Overlap Shift"
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Code
                  </label>
                  <input
                    type="text"
                    required
                    value={editingShift.code || ''}
                    onChange={(e) =>
                      setEditingShift({ ...editingShift, code: e.target.value })
                    }
                    placeholder="EMEA"
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={editingShift.startTime || ''}
                    onChange={(e) =>
                      setEditingShift({
                        ...editingShift,
                        startTime: e.target.value,
                      })
                    }
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={editingShift.endTime || ''}
                    onChange={(e) =>
                      setEditingShift({
                        ...editingShift,
                        endTime: e.target.value,
                      })
                    }
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Break Duration
                  </label>
                  <input
                    type="text"
                    value={editingShift.breakDuration || ''}
                    onChange={(e) =>
                      setEditingShift({
                        ...editingShift,
                        breakDuration: e.target.value,
                      })
                    }
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shift Allowance
                  </label>
                  <input
                    type="text"
                    value={editingShift.allowance || ''}
                    onChange={(e) =>
                      setEditingShift({
                        ...editingShift,
                        allowance: e.target.value,
                      })
                    }
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingShift(null)}
                  className="min-h-[44px] px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="min-h-[44px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                >
                  {isLoading ? 'Saving...' : 'Save Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Assigned Employees Modal */}
      {viewingAssignedShift && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-xs p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {viewingAssignedShift.name} Personnel
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {viewingAssignedShift.startTime} – {viewingAssignedShift.endTime}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingAssignedShift(null)}
                aria-label="Close assigned employees"
                className="min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
              {workforce.map((emp) => (
                <div
                  key={emp.id}
                  className="py-2.5 flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {emp.name}
                    </p>
                    <p className="text-slate-500">
                      <span className="font-mono">{emp.employeeId}</span> ·{' '}
                      {emp.department}
                    </p>
                  </div>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    {emp.shift}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface RostersModuleTabProps {
  rosters: RosterEntry[];
  canEdit: boolean;
  onSuccessToast: (msg: string) => void;
}

const WEEK_DAYS: Array<{
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  date: string;
}> = [
  { day: 'Mon', date: '02' },
  { day: 'Tue', date: '03' },
  { day: 'Wed', date: '04' },
  { day: 'Thu', date: '05' },
  { day: 'Fri', date: '06' },
  { day: 'Sat', date: '07' },
  { day: 'Sun', date: '08' },
];

export function RostersModuleTab({
  rosters,
  canEdit,
  onSuccessToast,
}: RostersModuleTabProps) {
  const [rosterHorizon, setRosterHorizon] = useState<'weekly' | 'monthly'>(
    'weekly'
  );
  const [selectedDay, setSelectedDay] = useState<
    'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  >('Thu');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [assignRosterShift] = useAssignRosterShiftMutation();

  const filteredRosters = filterRosterEntries(rosters, deptFilter, searchQuery);

  const handleCycleShift = async (
    entry: RosterEntry,
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun',
    currentCode: 'MS' | 'GS' | 'NS' | 'FLX' | 'OFF'
  ) => {
    if (!canEdit) return;
    const order: Array<'MS' | 'GS' | 'NS' | 'FLX' | 'OFF'> = [
      'GS',
      'MS',
      'NS',
      'FLX',
      'OFF',
    ];
    const nextCode = order[(order.indexOf(currentCode) + 1) % order.length];
    try {
      const res = await assignRosterShift({
        rosterId: entry.id,
        day,
        shiftCode: nextCode,
      }).unwrap();
      onSuccessToast(
        `${entry.employeeName}: ${day} assigned to ${nextCode} (${res.message})`
      );
    } catch {
      onSuccessToast('Unable to update shift assignment.');
    }
  };

  const handleApproveSwap = async (entry: RosterEntry) => {
    if (!canEdit) return;
    try {
      await assignRosterShift({
        rosterId: entry.id,
        day: 'Thu',
        shiftCode: 'MS',
        approveSwap: true,
      }).unwrap();
      onSuccessToast(`Shift swap approved for ${entry.employeeName}.`);
    } catch {
      onSuccessToast('Could not approve shift swap.');
    }
  };

  return (
    <div className="space-y-4" data-testid="rosters-module-tab">
      {/* Top Controls: Weekly / Monthly Switch + Department Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Duty Roster &amp; Shift Swaps
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tap any day chip on an employee card to reassign their shift
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setRosterHorizon('weekly')}
            className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              rosterHorizon === 'weekly'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Weekly Roster
          </button>
          <button
            type="button"
            onClick={() => setRosterHorizon('monthly')}
            className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              rosterHorizon === 'monthly'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Monthly Roster
          </button>
        </div>
      </div>

      {/* Horizontal Day Selector (Mobile Calendar Strip) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {WEEK_DAYS.map((item) => {
          const active = selectedDay === item.day;
          return (
            <button
              key={item.day}
              type="button"
              onClick={() => setSelectedDay(item.day)}
              className={`min-w-[54px] min-h-[56px] rounded-2xl border flex flex-col items-center justify-center transition-all shrink-0 cursor-pointer ${
                active
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white border-slate-900 dark:border-indigo-500 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <span className="text-[11px] font-medium opacity-80">
                {item.day}
              </span>
              <span className="text-sm font-bold font-mono tabular-nums mt-0.5">
                {item.date}
              </span>
            </button>
          );
        })}
      </div>

      {/* Department & Employee Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter roster by employee name or ID..."
            aria-label="Filter roster employees"
            className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-3.5 text-xs text-slate-900 dark:text-slate-100"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          aria-label="Filter roster by department"
          className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
        >
          <option value="All">All Departments ({rosters.length})</option>
          <option value="Engineering">Engineering</option>
          <option value="Product & Design">Product &amp; Design</option>
          <option value="Customer Success">Customer Success</option>
          <option value="Finance & Legal">Finance &amp; Legal</option>
        </select>
      </div>

      {/* Employee Roster Assignment Cards */}
      <div className="space-y-3">
        {filteredRosters.length === 0 ? (
          <div className="py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">No roster assignments found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {searchQuery || deptFilter !== 'All'
                ? 'No employees match the selected department or search filter.'
                : 'No shift roster assignments are available for this period.'}
            </p>
          </div>
        ) : (
          filteredRosters.map((entry) => (
            <div
              key={entry.id}
            data-testid={`roster-card-${entry.employeeId}`}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-2xs"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {entry.avatarInitials}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {entry.employeeId}
                    </span>
                    <span>·</span>
                    <span>{entry.department}</span>
                    <span>·</span>
                    <span>Off: {entry.weeklyOff}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {entry.employeeName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {entry.designation} · {entry.currentShift}
                  </p>
                </div>
              </div>

              {entry.swapStatus !== 'None' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    {entry.swapStatus}
                  </span>
                  {entry.swapStatus === 'Swap Requested' && canEdit && (
                    <button
                      type="button"
                      onClick={() => handleApproveSwap(entry)}
                      className="min-h-[36px] px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve Swap
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 7-Day Mobile Shift Selector Row */}
            <div className="grid grid-cols-7 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              {entry.schedule.map((slot) => {
                const isSelectedDay = slot.day === selectedDay;
                const codeColors: Record<string, string> = {
                  MS: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
                  GS: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
                  NS: 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
                  FLX: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                  OFF: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
                };

                return (
                  <button
                    key={slot.day}
                    type="button"
                    onClick={() =>
                      handleCycleShift(entry, slot.day, slot.shiftCode)
                    }
                    title={`Tap to cycle ${entry.employeeName}'s ${slot.day} shift (${slot.shiftLabel})`}
                    className={`min-h-[48px] rounded-xl border p-1.5 flex flex-col items-center justify-center transition-all cursor-pointer ${
                      codeColors[slot.shiftCode] || codeColors.GS
                    } ${
                      isSelectedDay
                        ? 'ring-2 ring-slate-900 dark:ring-indigo-400'
                        : ''
                    }`}
                  >
                    <span className="text-[10px] font-medium opacity-75">
                      {slot.day}
                    </span>
                    <span className="text-xs font-bold font-mono mt-0.5">
                      {slot.shiftCode}
                    </span>
                  </button>
                );
              })}
            </div>

            {rosterHorizon === 'monthly' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                <span>Monthly Allocation: 22 Working Days · 8 Weekly Offs</span>
                <span>Compliance: 100%</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface HolidaysModuleTabProps {
  holidays: HolidayItem[];
  canEdit: boolean;
  onSuccessToast: (msg: string) => void;
}

export function HolidaysModuleTab({
  holidays,
  canEdit,
  onSuccessToast,
}: HolidaysModuleTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    HolidayCategory | 'All'
  >('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [editingHoliday, setEditingHoliday] =
    useState<Partial<HolidayItem> | null>(null);
  const [viewingHoliday, setViewingHoliday] = useState<HolidayItem | null>(
    null
  );

  const [saveHoliday, { isLoading: isSaving }] = useSaveHolidayMutation();
  const [deleteHoliday] = useDeleteHolidayMutation();

  const filteredHolidays = filterHolidays(
    holidays,
    selectedCategory,
    selectedMonth
  );

  const handleSaveHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHoliday?.name || !editingHoliday?.date) return;
    try {
      const res = await saveHoliday({
        ...editingHoliday,
        name: editingHoliday.name,
        date: editingHoliday.date,
      }).unwrap();
      onSuccessToast(res.message);
      setEditingHoliday(null);
    } catch {
      onSuccessToast('Unable to save holiday.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!canEdit) return;
    try {
      await deleteHoliday({ id }).unwrap();
      onSuccessToast(`Removed "${name}" from company holiday calendar.`);
    } catch {
      onSuccessToast('Could not remove holiday.');
    }
  };

  return (
    <div className="space-y-4" data-testid="holidays-module-tab">
      {/* Header & Add Holiday Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            2026 Enterprise Holiday Calendar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Statutory national, regional, and restricted / optional holidays
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() =>
              setEditingHoliday({
                name: '',
                date: '2026-12-24',
                category: 'Optional',
                location: 'Global · All Hubs',
                description: 'Year-end restricted holiday.',
              })
            }
            data-testid="add-holiday-btn"
            className="min-h-[44px] px-4 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Holiday
          </button>
        )}
      </div>

      {/* Category & Month Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(['All', 'National', 'Regional', 'Optional'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat === 'Optional' ? 'Optional / Restricted' : cat}
            </button>
          ))}
        </div>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          aria-label="Filter holidays by month"
          className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200"
        >
          <option value="All">All Months</option>
          <option value="November">November</option>
          <option value="December">December</option>
        </select>
      </div>

      {/* Holiday List Cards */}
      <div className="space-y-3">
        {filteredHolidays.length === 0 ? (
          <div className="py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">No holidays found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No corporate or statutory holidays match the selected category or month filter.
            </p>
          </div>
        ) : (
          filteredHolidays.map((holiday) => (
            <div
              key={holiday.id}
            data-testid={`holiday-card-${holiday.id}`}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-2xs"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center shrink-0 font-mono">
                <span className="text-[10px] font-semibold uppercase">
                  {holiday.month.slice(0, 3)}
                </span>
                <span className="text-sm font-bold tabular-nums">
                  {holiday.date.split('-')[2] || '01'}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {holiday.category}
                  </span>
                  <span>·</span>
                  <span>{holiday.dayOfWeek}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {holiday.location}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {holiday.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {holiday.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setViewingHoliday(holiday)}
                className="min-h-[38px] px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer"
              >
                Details
              </button>
              {canEdit && (
                <>
                  <button
                    type="button"
                    onClick={() => setEditingHoliday(holiday)}
                    aria-label={`Edit ${holiday.name}`}
                    className="min-w-[38px] min-h-[38px] rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center justify-center cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(holiday.id, holiday.name)}
                    aria-label={`Delete ${holiday.name}`}
                    className="min-w-[38px] min-h-[38px] rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Holiday Modal */}
      {editingHoliday && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-xs p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingHoliday.id ? 'Edit Holiday' : 'Add Company Holiday'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingHoliday(null)}
                aria-label="Close holiday modal"
                className="min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveHoliday} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Holiday Name
                </label>
                <input
                  type="text"
                  required
                  value={editingHoliday.name || ''}
                  onChange={(e) =>
                    setEditingHoliday({ ...editingHoliday, name: e.target.value })
                  }
                  placeholder="e.g. Founder's Day Observance"
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editingHoliday.date || ''}
                    onChange={(e) =>
                      setEditingHoliday({
                        ...editingHoliday,
                        date: e.target.value,
                      })
                    }
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={editingHoliday.category || 'National'}
                    onChange={(e) =>
                      setEditingHoliday({
                        ...editingHoliday,
                        category: e.target.value as HolidayCategory,
                      })
                    }
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-100"
                  >
                    <option value="National">National</option>
                    <option value="Regional">Regional</option>
                    <option value="Optional">Optional / Restricted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Applicable Location
                </label>
                <input
                  type="text"
                  value={editingHoliday.location || ''}
                  onChange={(e) =>
                    setEditingHoliday({
                      ...editingHoliday,
                      location: e.target.value,
                    })
                  }
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editingHoliday.description || ''}
                  onChange={(e) =>
                    setEditingHoliday({
                      ...editingHoliday,
                      description: e.target.value,
                    })
                  }
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingHoliday(null)}
                  className="min-h-[44px] px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="min-h-[44px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Holiday Details Modal */}
      {viewingHoliday && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-xs p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {viewingHoliday.category} Holiday · {viewingHoliday.displayDate}
              </span>
              <button
                type="button"
                onClick={() => setViewingHoliday(null)}
                aria-label="Close holiday details"
                className="min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {viewingHoliday.name}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {viewingHoliday.description}
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              Location: {viewingHoliday.location} · Day: {viewingHoliday.dayOfWeek}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
