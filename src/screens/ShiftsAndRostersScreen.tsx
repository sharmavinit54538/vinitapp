'use client';

import React, { useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import {
  ShiftItem,
  RosterEntry,
  filterRosterEntries,
  shiftFormSchema,
} from '@/lib/hr-dashboard-logic';
import {
  useSaveShiftMutation,
  useAssignRosterShiftMutation,
} from '@/lib/store/hr-api';
import {
  LinkedInEmptyState,
  LinkedInSection,
} from '@/src/components/linkedin/LinkedInPrimitives';

interface ShiftsAndRostersScreenProps {
  mode: 'shifts' | 'rosters';
  shifts: ShiftItem[];
  rosters: RosterEntry[];
  isDark: boolean;
  canManage: boolean;
  onSuccessToast: (msg: string) => void;
}

const SHIFT_CODES: ('MS' | 'GS' | 'NS' | 'FLX' | 'OFF')[] = [
  'GS',
  'MS',
  'NS',
  'FLX',
  'OFF',
];

export function ShiftsAndRostersScreen({
  mode,
  shifts,
  rosters,
  canManage,
  onSuccessToast,
}: ShiftsAndRostersScreenProps) {
  const [saveShift, { isLoading: isSavingShift }] = useSaveShiftMutation();
  const [assignRosterShift] = useAssignRosterShiftMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftItem | null>(null);
  const [name, setName] = useState('General Shift');
  const [code, setCode] = useState('GS');
  const [startTime, setStartTime] = useState('09:30 AM');
  const [endTime, setEndTime] = useState('06:30 PM');
  const [breakDuration, setBreakDuration] = useState('60 mins');
  const [allowance, setAllowance] = useState('$0 / day');
  const [assignedEmployees, setAssignedEmployees] = useState('45');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [rosterSearch, setRosterSearch] = useState('');
  const filteredRosters = filterRosterEntries(rosters, 'All', rosterSearch);

  const openCreateShift = () => {
    setEditingShift(null);
    setName('');
    setCode('GS');
    setStartTime('09:30 AM');
    setEndTime('06:30 PM');
    setBreakDuration('60 mins');
    setAllowance('$15 / day');
    setAssignedEmployees('25');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditShift = (s: ShiftItem) => {
    setEditingShift(s);
    setName(s.name);
    setCode(s.code);
    setStartTime(s.startTime);
    setEndTime(s.endTime);
    setBreakDuration(s.breakDuration);
    setAllowance(s.allowance);
    setAssignedEmployees(String(s.assignedEmployees));
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSaveShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const parsed = shiftFormSchema.safeParse({
      name,
      code,
      startTime,
      endTime,
      breakDuration,
      allowance,
      assignedEmployees: Number(assignedEmployees) || 1,
    });

    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message || 'Please check shift fields');
      return;
    }

    try {
      await saveShift({
        id: editingShift?.id,
        ...parsed.data,
        status: 'Active',
        departments: ['Engineering', 'Operations'],
      }).unwrap();
      onSuccessToast(`Shift ${parsed.data.name} saved`);
      setIsModalOpen(false);
    } catch {
      setErrorMsg('Failed to save shift configuration');
    }
  };

  const handleCycleRosterCode = async (
    rosterId: string,
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun',
    currentCode: 'MS' | 'GS' | 'NS' | 'FLX' | 'OFF'
  ) => {
    if (!canManage) return;
    const nextIdx = (SHIFT_CODES.indexOf(currentCode) + 1) % SHIFT_CODES.length;
    const nextCode = SHIFT_CODES[nextIdx];
    try {
      await assignRosterShift({
        rosterId,
        day,
        shiftCode: nextCode,
      }).unwrap();
      onSuccessToast(`Updated ${day} shift to ${nextCode}`);
    } catch {
      onSuccessToast('Unable to update shift assignment');
    }
  };

  if (mode === 'shifts') {
    return (
      <div className="flex flex-col gap-2 md:gap-3">
        <LinkedInSection>
          <div className="flex items-center justify-between gap-3 px-4 py-4 border-b border-[#E5E7EB]">
            <div className="min-w-0">
              <h2 className="text-[16px] font-semibold text-[#171717] tracking-[-0.01em]">
                Shift windows
              </h2>
              <p className="mt-0.5 text-[12px] text-[#666666]">
                Active shift timings, breaks, and allowances
              </p>
            </div>
            {canManage ? (
              <button
                type="button"
                onClick={openCreateShift}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-[#0A66C2] px-3.5 text-[13px] font-semibold text-white hover:bg-[#004182] transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" strokeWidth={2.2} />
                Create shift
              </button>
            ) : null}
          </div>

          {shifts.length === 0 ? (
            <LinkedInEmptyState
              title="No shift windows configured"
              subtitle="Use Create shift to configure Morning, General, or Night shift windows."
              variant="neutral"
            />
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {shifts.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 px-4 py-3.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-[#171717]">
                      {s.name}{' '}
                      <span className="font-normal text-[#666666] tabular-nums">
                        · {s.code}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[12px] text-[#666666] tabular-nums">
                      {s.startTime} – {s.endTime} · Break: {s.breakDuration} · {s.status}
                    </p>
                    <p className="mt-1 text-[12px] text-[#404040] tabular-nums">
                      {s.assignedEmployees} assigned · Allowance: {s.allowance}
                    </p>
                  </div>
                  {canManage ? (
                    <button
                      type="button"
                      onClick={() => openEditShift(s)}
                      className="h-8 shrink-0 rounded-md px-2.5 text-[13px] font-semibold text-[#0A66C2] hover:bg-[#F3F2EF] transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </LinkedInSection>

        {isModalOpen ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editingShift ? 'Edit shift window' : 'Create shift window'}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/45 md:p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <form
              onSubmit={handleSaveShift}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[460px] bg-white rounded-t-lg md:rounded-lg border border-[#E5E7EB] overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 h-13">
                <h3 className="text-[15px] font-semibold text-[#171717]">
                  {editingShift ? 'Edit shift window' : 'Create shift window'}
                </h3>
                <button
                  type="button"
                  aria-label="Close shift form"
                  onClick={() => setIsModalOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-[#404040] hover:bg-[#F3F2EF] cursor-pointer"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {errorMsg ? (
                  <div
                    role="alert"
                    className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[12px] font-medium text-[#B91C1C]"
                  >
                    {errorMsg}
                  </div>
                ) : null}

                <div>
                  <label htmlFor="shift-name" className="block text-[12px] font-medium text-[#404040] mb-1">
                    Shift name *
                  </label>
                  <input
                    id="shift-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Morning Shift"
                    className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] focus:border-[#0A66C2] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="shift-code" className="block text-[12px] font-medium text-[#404040] mb-1">
                      Code *
                    </label>
                    <input
                      id="shift-code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="MS"
                      className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] focus:border-[#0A66C2] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="shift-headcount" className="block text-[12px] font-medium text-[#404040] mb-1">
                      Headcount *
                    </label>
                    <input
                      id="shift-headcount"
                      type="number"
                      value={assignedEmployees}
                      onChange={(e) => setAssignedEmployees(e.target.value)}
                      placeholder="30"
                      className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] tabular-nums focus:border-[#0A66C2] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="shift-start" className="block text-[12px] font-medium text-[#404040] mb-1">
                      Start time *
                    </label>
                    <input
                      id="shift-start"
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      placeholder="09:30 AM"
                      className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] tabular-nums focus:border-[#0A66C2] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="shift-end" className="block text-[12px] font-medium text-[#404040] mb-1">
                      End time *
                    </label>
                    <input
                      id="shift-end"
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      placeholder="06:30 PM"
                      className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] tabular-nums focus:border-[#0A66C2] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] px-4 py-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 rounded-md border border-[#E5E7EB] bg-white px-4 text-[13px] font-medium text-[#171717] hover:bg-[#F3F2EF] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingShift}
                  className="h-9 rounded-md bg-[#0A66C2] px-4 text-[13px] font-semibold text-white hover:bg-[#004182] disabled:opacity-50 cursor-pointer"
                >
                  {isSavingShift ? 'Saving...' : 'Save shift'}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 md:gap-3">
      <LinkedInSection>
        <div className="px-4 pt-4 pb-3 border-b border-[#E5E7EB]">
          <h2 className="text-[16px] font-semibold text-[#171717] tracking-[-0.01em]">
            Weekly duty rosters
          </h2>
          <p className="mt-0.5 text-[12px] text-[#666666]">
            Select any day cell to cycle employee shift assignment
          </p>

          <div className="relative mt-3 flex items-center">
            <Search
              className="pointer-events-none absolute left-3 h-4 w-4 text-[#666666]"
              strokeWidth={1.85}
            />
            <input
              type="text"
              value={rosterSearch}
              onChange={(e) => setRosterSearch(e.target.value)}
              placeholder="Search employee roster"
              aria-label="Search employee roster"
              className="h-10 w-full rounded-md border border-[#E5E7EB] bg-[#FAFAFA] pl-9 pr-3 text-[13px] text-[#171717] placeholder:text-[#666666] focus:border-[#0A66C2] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {filteredRosters.length === 0 ? (
          <LinkedInEmptyState
            title="No active duty rosters"
            subtitle="No employee roster entries are currently assigned."
            variant="neutral"
          />
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {filteredRosters.map((r) => (
              <div key={r.id} className="px-4 py-3.5">
                <p className="text-[14px] font-semibold text-[#171717]">
                  {r.employeeName}{' '}
                  <span className="font-normal text-[#666666] tabular-nums">
                    · {r.employeeId}
                  </span>
                </p>
                <p className="mt-0.5 text-[12px] text-[#666666]">
                  {r.designation} · {r.department}
                </p>

                <div className="mt-2.5 grid grid-cols-7 gap-1.5">
                  {r.schedule.map((slot) => (
                    <button
                      key={slot.day}
                      type="button"
                      onClick={() => handleCycleRosterCode(r.id, slot.day, slot.shiftCode)}
                      className={`flex flex-col items-center justify-center rounded-md border py-2 text-center transition-colors cursor-pointer ${
                        slot.shiftCode === 'OFF'
                          ? 'border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]'
                          : 'border-[#E5E7EB] bg-[#FAFAFA] text-[#0A66C2] hover:bg-[#F3F2EF]'
                      }`}
                    >
                      <span className="text-[10px] font-medium text-[#666666]">
                        {slot.day}
                      </span>
                      <span className="mt-0.5 text-[11px] font-semibold tabular-nums">
                        {slot.shiftCode}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </LinkedInSection>
    </div>
  );
}
