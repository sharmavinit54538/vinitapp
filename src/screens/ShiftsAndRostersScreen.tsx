'use client';

/**
 * OFC360 Shifts & Rosters Screen — Wired to RTK Query `attendanceApi`
 *
 * - Shifts: GET/POST/PATCH/DELETE /api/v1/attendance/shifts (strict 24h HH:MM, overnight support)
 * - My Schedule: GET /api/v1/attendance/shifts/me/schedule
 * - Shift Change Request: POST /api/v1/attendance/shifts/change-requests
 *   (notes that /shifts/options is admin/manager gated in snapshot)
 * - Rosters: GET/POST/PATCH/DELETE /api/v1/attendance/rosters & POST /rosters/bulk
 *   (all 12 ROSTER_TYPES, 2,000-cell bulk validation, paired custom start/end times)
 */

import React, { useMemo, useState } from 'react';
import { Calendar, Layers, Plus, Search, Trash2, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import {
  useBulkCreateRosterMutation,
  useCreateRosterMutation,
  useCreateShiftMutation,
  useDeleteRosterMutation,
  useDeleteShiftMutation,
  useGetMyShiftScheduleQuery,
  useGetRostersQuery,
  useGetShiftOptionsQuery,
  useGetShiftsQuery,
  useSubmitShiftChangeRequestMutation,
  useUpdateShiftMutation,
} from '@/src/features/attendance/attendanceApi';
import {
  setRosterFilters,
  setShiftsSearch,
} from '@/src/features/attendance/attendanceSlice';
import {
  isOvernightShiftWindow,
} from '@/src/features/attendance/builders';
import {
  AttendanceApiError,
  ROSTER_TYPES,
  RosterType,
  ShiftRecord,
} from '@/src/features/attendance/types';
import {
  LinkedInEmptyState,
  LinkedInErrorState,
  LinkedInLoadingRows,
  LinkedInSection,
} from '@/src/components/linkedin/LinkedInPrimitives';

interface ShiftsAndRostersScreenProps {
  mode: 'shifts' | 'rosters';
  isDark: boolean;
  canManage: boolean;
  onSuccessToast: (msg: string) => void;
}

function asApiError(err: unknown): AttendanceApiError | null {
  if (!err || typeof err !== 'object') return null;
  if ('status' in err && 'message' in err) return err as AttendanceApiError;
  return null;
}

export function ShiftsAndRostersScreen({
  mode,
  canManage,
  onSuccessToast,
}: ShiftsAndRostersScreenProps) {
  const dispatch = useAppDispatch();
  const ui = useAppSelector((state) => state.attendanceUi);
  const scopeReady = Boolean(ui.activeScopeKey);

  // Shifts & Schedule Queries
  const myScheduleQuery = useGetMyShiftScheduleQuery(
    { scopeKey: ui.activeScopeKey || undefined },
    { skip: !scopeReady || mode !== 'shifts' }
  );
  const shiftsQuery = useGetShiftsQuery(
    {
      search: ui.shiftsSearch || undefined,
      page: 1,
      limit: 50,
      scopeKey: ui.activeScopeKey || undefined,
    },
    { skip: !scopeReady || !canManage }
  );
  const shiftOptionsQuery = useGetShiftOptionsQuery(
    { scopeKey: ui.activeScopeKey || undefined },
    { skip: !scopeReady || !canManage }
  );

  // Rosters Query
  const rostersQuery = useGetRostersQuery(
    {
      department: ui.rosterDepartmentFilter || undefined,
      shift_type: ui.rosterShiftTypeFilter || undefined,
      page: 1,
      limit: 100,
      scopeKey: ui.activeScopeKey || undefined,
    },
    { skip: !scopeReady || mode !== 'rosters' || !canManage }
  );

  // Mutations
  const [createShift, { isLoading: isCreatingShift }] = useCreateShiftMutation();
  const [updateShift, { isLoading: isUpdatingShift }] = useUpdateShiftMutation();
  const [deleteShift] = useDeleteShiftMutation();
  const [submitShiftChange, { isLoading: isSubmittingChange }] =
    useSubmitShiftChangeRequestMutation();
  const [createRoster, { isLoading: isCreatingRoster }] = useCreateRosterMutation();
  const [bulkCreateRoster, { isLoading: isBulkCreating }] = useBulkCreateRosterMutation();
  const [deleteRoster] = useDeleteRosterMutation();

  // Shift create/edit modal state (24h HH:MM)
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftRecord | null>(null);
  const [shiftName, setShiftName] = useState('');
  const [shiftStart, setShiftStart] = useState('09:00');
  const [shiftEnd, setShiftEnd] = useState('18:00');
  const [shiftError, setShiftError] = useState<string | null>(null);

  // Shift change request modal state
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [requestedShiftId, setRequestedShiftId] = useState('');
  const [changeStartDate, setChangeStartDate] = useState('');
  const [changeEndDate, setChangeEndDate] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [changeError, setChangeError] = useState<string | null>(null);

  // Single roster create/upsert modal state
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [rosterEmployeeId, setRosterEmployeeId] = useState('');
  const [rosterDate, setRosterDate] = useState('');
  const [rosterShiftId, setRosterShiftId] = useState('');
  const [rosterShiftType, setRosterShiftType] = useState<RosterType>('DAY');
  const [rosterStartTime, setRosterStartTime] = useState('');
  const [rosterEndTime, setRosterEndTime] = useState('');
  const [rosterNotes, setRosterNotes] = useState('');
  const [rosterError, setRosterError] = useState<string | null>(null);

  // Bulk roster modal state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkEmployeeIdsText, setBulkEmployeeIdsText] = useState('');
  const [bulkStartDate, setBulkStartDate] = useState('');
  const [bulkEndDate, setBulkEndDate] = useState('');
  const [bulkShiftId, setBulkShiftId] = useState('');
  const [bulkShiftType, setBulkShiftType] = useState<RosterType>('DAY');
  const [bulkError, setBulkError] = useState<string | null>(null);

  const shiftPreviewOvernight = useMemo(() => {
    try {
      return isOvernightShiftWindow(shiftStart, shiftEnd);
    } catch {
      return false;
    }
  }, [shiftStart, shiftEnd]);

  const openCreateShift = () => {
    setEditingShift(null);
    setShiftName('');
    setShiftStart('09:00');
    setShiftEnd('18:00');
    setShiftError(null);
    setIsShiftModalOpen(true);
  };

  const openEditShift = (shift: ShiftRecord) => {
    setEditingShift(shift);
    setShiftName(shift.name);
    setShiftStart(shift.start_time.slice(0, 5));
    setShiftEnd(shift.end_time.slice(0, 5));
    setShiftError(null);
    setIsShiftModalOpen(true);
  };

  const handleSaveShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setShiftError(null);
    try {
      if (editingShift) {
        await updateShift({
          shiftId: editingShift.id,
          name: shiftName,
          startTime: shiftStart,
          endTime: shiftEnd,
          method: 'PATCH',
        }).unwrap();
        onSuccessToast(`Shift "${shiftName.trim()}" updated`);
      } else {
        await createShift({
          name: shiftName,
          startTime: shiftStart,
          endTime: shiftEnd,
        }).unwrap();
        onSuccessToast(`Shift "${shiftName.trim()}" created`);
      }
      setIsShiftModalOpen(false);
    } catch (err) {
      setShiftError(asApiError(err)?.message || 'Failed to save shift.');
    }
  };

  const handleDeleteShift = async (shift: ShiftRecord) => {
    try {
      await deleteShift({ shiftId: shift.id }).unwrap();
      onSuccessToast(`Shift "${shift.name}" deleted`);
    } catch (err) {
      onSuccessToast(asApiError(err)?.message || 'Unable to delete shift');
    }
  };

  const handleSubmitShiftChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);
    try {
      const res = await submitShiftChange({
        requestedShiftId,
        startDate: changeStartDate,
        endDate: changeEndDate || undefined,
        reason: changeReason,
      }).unwrap();
      onSuccessToast(
        res.message || `Shift change request submitted (${res.status || 'pending'})`
      );
      setIsChangeModalOpen(false);
      setRequestedShiftId('');
      setChangeStartDate('');
      setChangeEndDate('');
      setChangeReason('');
    } catch (err) {
      setChangeError(asApiError(err)?.message || 'Unable to submit shift change request.');
    }
  };

  const handleCreateRoster = async (e: React.FormEvent) => {
    e.preventDefault();
    setRosterError(null);
    try {
      await createRoster({
        employeeId: rosterEmployeeId,
        shiftDate: rosterDate,
        shiftId: rosterShiftId || undefined,
        shiftType: rosterShiftType,
        startTime: rosterStartTime || undefined,
        endTime: rosterEndTime || undefined,
        notes: rosterNotes || undefined,
      }).unwrap();
      onSuccessToast('Roster entry saved');
      setIsRosterModalOpen(false);
      setRosterEmployeeId('');
      setRosterDate('');
      setRosterStartTime('');
      setRosterEndTime('');
      setRosterNotes('');
    } catch (err) {
      setRosterError(asApiError(err)?.message || 'Unable to save roster entry.');
    }
  };

  const handleBulkRosterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkError(null);
    const employeeIds = bulkEmployeeIdsText
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const res = await bulkCreateRoster({
        employeeIds,
        startDate: bulkStartDate,
        endDate: bulkEndDate,
        shiftId: bulkShiftId || undefined,
        shiftType: bulkShiftType,
      }).unwrap();
      onSuccessToast(
        `Bulk roster applied: ${res.created} created, ${res.updated} updated (${res.total} total)`
      );
      setIsBulkModalOpen(false);
      setBulkEmployeeIdsText('');
    } catch (err) {
      setBulkError(asApiError(err)?.message || 'Unable to apply bulk roster.');
    }
  };

  const handleDeleteRoster = async (rosterId: string) => {
    try {
      await deleteRoster({ rosterId }).unwrap();
      onSuccessToast('Roster entry deleted');
    } catch (err) {
      onSuccessToast(asApiError(err)?.message || 'Unable to delete roster entry');
    }
  };

  // =========================================================================
  // SHIFTS MODE
  // =========================================================================
  if (mode === 'shifts') {
    const shiftOptions = shiftOptionsQuery.data?.options || [];
    const shifts = shiftsQuery.data?.items || [];

    return (
      <div className="flex flex-col gap-2 md:gap-3">
        {/* Employee My Schedule Section */}
        <LinkedInSection>
          <div className="flex items-center justify-between gap-3 px-4 py-4 border-b border-[#E5E7EB]">
            <div className="min-w-0">
              <h2 className="text-[16px] font-semibold text-[#171717] tracking-[-0.01em]">
                My shift schedule
              </h2>
              <p className="mt-0.5 text-[12px] text-[#666666]">
                {myScheduleQuery.data?.current_shift
                  ? `Current shift: ${myScheduleQuery.data.current_shift.name} (${myScheduleQuery.data.current_shift.start_time} – ${myScheduleQuery.data.current_shift.end_time})`
                  : 'Assigned shift schedule from server'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setChangeError(null);
                setIsChangeModalOpen(true);
              }}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-[#0A66C2] bg-white px-3 text-[12px] font-semibold text-[#0A66C2] hover:bg-[#EFF6FF] cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5" />
              Request change
            </button>
          </div>

          {myScheduleQuery.isLoading ? (
            <LinkedInLoadingRows rows={2} />
          ) : myScheduleQuery.isError ? (
            <LinkedInErrorState
              message={
                asApiError(myScheduleQuery.error)?.message ||
                'Unable to load your shift schedule.'
              }
              onRetry={() => void myScheduleQuery.refetch()}
            />
          ) : !myScheduleQuery.data || myScheduleQuery.data.schedule.length === 0 ? (
            <LinkedInEmptyState
              title="No upcoming shift entries"
              subtitle="Server returned no scheduled shifts for your profile."
              variant="neutral"
            />
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {myScheduleQuery.data.schedule.map((entry, idx) => (
                <div
                  key={`${entry.date}-${idx}`}
                  className="flex items-center justify-between px-4 py-3 text-[13px]"
                >
                  <div>
                    <p className="font-semibold text-[#171717] tabular-nums">{entry.date}</p>
                    <p className="text-[12px] text-[#666666]">
                      {entry.shift_name || entry.shift_type || 'Assigned shift'}
                    </p>
                  </div>
                  <span className="text-[12px] font-medium text-[#404040] tabular-nums">
                    {entry.start_time && entry.end_time
                      ? `${entry.start_time} – ${entry.end_time}`
                      : entry.shift_type || '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </LinkedInSection>

        {/* Admin / Manager Shift Catalog */}
        {canManage ? (
          <LinkedInSection>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 border-b border-[#E5E7EB]">
              <div className="min-w-0">
                <h2 className="text-[16px] font-semibold text-[#171717] tracking-[-0.01em]">
                  Company shift windows
                </h2>
                <p className="mt-0.5 text-[12px] text-[#666666]">
                  24-hour HH:MM windows (end earlier than start denotes an overnight shift)
                </p>
              </div>
              <button
                type="button"
                onClick={openCreateShift}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-[#0A66C2] px-3.5 text-[13px] font-semibold text-white hover:bg-[#004182] cursor-pointer"
              >
                <Plus className="h-4 w-4" strokeWidth={2.2} />
                Create shift
              </button>
            </div>

            <div className="px-4 py-3 border-b border-[#E5E7EB]">
              <div className="relative flex items-center">
                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[#666666]" />
                <input
                  type="text"
                  value={ui.shiftsSearch}
                  onChange={(e) => dispatch(setShiftsSearch(e.target.value))}
                  placeholder="Search shift windows"
                  aria-label="Search shift windows"
                  className="h-9 w-full rounded-md border border-[#E5E7EB] bg-[#FAFAFA] pl-9 pr-3 text-[13px] text-[#171717] focus:border-[#0A66C2] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {shiftsQuery.isLoading ? (
              <LinkedInLoadingRows rows={3} />
            ) : shiftsQuery.isError ? (
              <LinkedInErrorState
                message={
                  asApiError(shiftsQuery.error)?.message || 'Unable to load shift windows.'
                }
                onRetry={() => void shiftsQuery.refetch()}
              />
            ) : shifts.length === 0 ? (
              <LinkedInEmptyState
                title="No shift windows configured"
                subtitle="Use Create shift to configure 24-hour day or overnight shift windows."
                variant="neutral"
              />
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {shifts.map((s) => {
                  const overnight =
                    s.is_overnight ||
                    (() => {
                      try {
                        return isOvernightShiftWindow(
                          s.start_time.slice(0, 5),
                          s.end_time.slice(0, 5)
                        );
                      } catch {
                        return false;
                      }
                    })();
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between gap-3 px-4 py-3.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-semibold text-[#171717]">
                          {s.name}
                          {s.code ? (
                            <span className="font-normal text-[#666666]"> · {s.code}</span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 text-[12px] text-[#666666] tabular-nums">
                          {s.start_time} – {s.end_time}
                          {overnight ? ' (+1d overnight)' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditShift(s)}
                          className="h-8 rounded-md px-2.5 text-[13px] font-semibold text-[#0A66C2] hover:bg-[#F3F2EF] cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete shift ${s.name}`}
                          onClick={() => void handleDeleteShift(s)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-[#B91C1C] hover:bg-[#FEF2F2] cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </LinkedInSection>
        ) : null}

        {/* Create / Edit Shift Modal */}
        {isShiftModalOpen ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editingShift ? 'Edit shift window' : 'Create shift window'}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/45 md:p-4"
            onClick={() => setIsShiftModalOpen(false)}
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
                  onClick={() => setIsShiftModalOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-[#404040] hover:bg-[#F3F2EF] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                {shiftError ? (
                  <div
                    role="alert"
                    className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#B91C1C]"
                  >
                    {shiftError}
                  </div>
                ) : null}

                <div>
                  <label htmlFor="shift-name" className="block text-[12px] font-medium text-[#404040] mb-1">
                    Shift name (1–50 chars) *
                  </label>
                  <input
                    id="shift-name"
                    type="text"
                    required
                    maxLength={50}
                    value={shiftName}
                    onChange={(e) => setShiftName(e.target.value)}
                    placeholder="General Shift"
                    className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] focus:border-[#0A66C2] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="shift-start" className="block text-[12px] font-medium text-[#404040] mb-1">
                      Start time (24h HH:MM) *
                    </label>
                    <input
                      id="shift-start"
                      type="time"
                      required
                      value={shiftStart}
                      onChange={(e) => setShiftStart(e.target.value)}
                      className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] tabular-nums"
                    />
                  </div>
                  <div>
                    <label htmlFor="shift-end" className="block text-[12px] font-medium text-[#404040] mb-1">
                      End time (24h HH:MM) *
                    </label>
                    <input
                      id="shift-end"
                      type="time"
                      required
                      value={shiftEnd}
                      onChange={(e) => setShiftEnd(e.target.value)}
                      className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] tabular-nums"
                    />
                  </div>
                </div>

                {shiftPreviewOvernight ? (
                  <p className="text-[12px] text-[#0A66C2]">
                    End time is earlier than start time — this will be saved as an overnight shift.
                  </p>
                ) : null}
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] px-4 py-3">
                <button
                  type="button"
                  onClick={() => setIsShiftModalOpen(false)}
                  className="h-9 rounded-md border border-[#E5E7EB] bg-white px-4 text-[13px] font-medium text-[#171717] hover:bg-[#F3F2EF] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingShift || isUpdatingShift}
                  className="h-9 rounded-md bg-[#0A66C2] px-4 text-[13px] font-semibold text-white hover:bg-[#004182] disabled:opacity-50 cursor-pointer"
                >
                  {isCreatingShift || isUpdatingShift ? 'Saving…' : 'Save shift'}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {/* Shift Change Request Modal */}
        {isChangeModalOpen ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Request shift change"
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/45 md:p-4"
            onClick={() => setIsChangeModalOpen(false)}
          >
            <form
              onSubmit={handleSubmitShiftChange}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[460px] bg-white rounded-t-lg md:rounded-lg border border-[#E5E7EB] overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 h-13">
                <h3 className="text-[15px] font-semibold text-[#171717]">
                  Request shift change
                </h3>
                <button
                  type="button"
                  aria-label="Close shift change modal"
                  onClick={() => setIsChangeModalOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-[#404040] hover:bg-[#F3F2EF] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                {changeError ? (
                  <div
                    role="alert"
                    className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#B91C1C]"
                  >
                    {changeError}
                  </div>
                ) : null}

                <div>
                  <label htmlFor="req-shift-id" className="block text-[12px] font-medium text-[#404040] mb-1">
                    Requested shift *
                  </label>
                  {shiftOptions.length > 0 ? (
                    <select
                      id="req-shift-id"
                      required
                      value={requestedShiftId}
                      onChange={(e) => setRequestedShiftId(e.target.value)}
                      className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#171717]"
                    >
                      <option value="">Select target shift</option>
                      {shiftOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name} {opt.start_time ? `(${opt.start_time}–${opt.end_time})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-1">
                      <input
                        id="req-shift-id"
                        type="text"
                        required
                        value={requestedShiftId}
                        onChange={(e) => setRequestedShiftId(e.target.value)}
                        placeholder="Target shift UUID"
                        className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717]"
                      />
                      <p className="text-[11px] text-[#666666]">
                        Note: GET /api/v1/attendance/shifts/options requires admin/manager access
                        in this backend contract.
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="change-start" className="block text-[12px] font-medium text-[#404040] mb-1">
                      Start date *
                    </label>
                    <input
                      id="change-start"
                      type="date"
                      required
                      value={changeStartDate}
                      onChange={(e) => setChangeStartDate(e.target.value)}
                      className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717]"
                    />
                  </div>
                  <div>
                    <label htmlFor="change-end" className="block text-[12px] font-medium text-[#404040] mb-1">
                      End date (optional)
                    </label>
                    <input
                      id="change-end"
                      type="date"
                      value={changeEndDate}
                      onChange={(e) => setChangeEndDate(e.target.value)}
                      className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="change-reason" className="block text-[12px] font-medium text-[#404040] mb-1">
                    Reason (1–1000 chars) *
                  </label>
                  <textarea
                    id="change-reason"
                    required
                    maxLength={1000}
                    rows={2}
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    placeholder="Explain the requested shift schedule adjustment"
                    className="w-full rounded-md border border-[#E5E7EB] p-3 text-[13px] text-[#171717]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] px-4 py-3">
                <button
                  type="button"
                  onClick={() => setIsChangeModalOpen(false)}
                  className="h-9 rounded-md border border-[#E5E7EB] bg-white px-4 text-[13px] font-medium text-[#171717] hover:bg-[#F3F2EF] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingChange}
                  className="h-9 rounded-md bg-[#0A66C2] px-4 text-[13px] font-semibold text-white hover:bg-[#004182] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingChange ? 'Submitting…' : 'Submit request'}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    );
  }

  // =========================================================================
  // ROSTERS MODE (Admin/Manager)
  // =========================================================================
  const rosters = rostersQuery.data?.items || [];
  const shiftOptions = shiftOptionsQuery.data?.options || [];

  return (
    <div className="flex flex-col gap-2 md:gap-3">
      <LinkedInSection>
        <div className="px-4 py-4 border-b border-[#E5E7EB] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-[16px] font-semibold text-[#171717] tracking-[-0.01em]">
                Duty rosters
              </h2>
              <p className="mt-0.5 text-[12px] text-[#666666]">
                Backend roster assignments supporting all 12 shift types and bulk scheduling
              </p>
            </div>
            {canManage ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBulkError(null);
                    setIsBulkModalOpen(true);
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-semibold text-[#171717] hover:bg-[#F3F2EF] cursor-pointer"
                >
                  <Layers className="h-3.5 w-3.5" />
                  Bulk assign
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRosterError(null);
                    setIsRosterModalOpen(true);
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#0A66C2] px-3.5 text-[12px] font-semibold text-white hover:bg-[#004182] cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Assign roster
                </button>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={ui.rosterDepartmentFilter}
              onChange={(e) =>
                dispatch(setRosterFilters({ department: e.target.value }))
              }
              placeholder="Filter by department"
              aria-label="Filter rosters by department"
              className="h-9 rounded-md border border-[#E5E7EB] bg-[#FAFAFA] px-3 text-[12px] text-[#171717] focus:border-[#0A66C2] focus:bg-white focus:outline-none"
            />
            <select
              value={ui.rosterShiftTypeFilter}
              onChange={(e) =>
                dispatch(
                  setRosterFilters({
                    shiftType: e.target.value as RosterType | '',
                  })
                )
              }
              aria-label="Filter rosters by shift type"
              className="h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] text-[#171717]"
            >
              <option value="">All shift types (12)</option>
              {ROSTER_TYPES.map((rt) => (
                <option key={rt} value={rt}>
                  {rt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!canManage ? (
          <LinkedInEmptyState
            title="Admin or manager access required"
            subtitle="Company duty roster management requires an authorized admin or manager role."
            variant="neutral"
          />
        ) : rostersQuery.isLoading ? (
          <LinkedInLoadingRows rows={3} />
        ) : rostersQuery.isError ? (
          <LinkedInErrorState
            message={
              asApiError(rostersQuery.error)?.message || 'Unable to load duty rosters.'
            }
            onRetry={() => void rostersQuery.refetch()}
          />
        ) : rosters.length === 0 ? (
          <LinkedInEmptyState
            title="No duty rosters found"
            subtitle="Use Assign roster or Bulk assign to schedule shifts."
            variant="neutral"
          />
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {rosters.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 px-4 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-[#171717]">
                    {r.employee_name || r.employee_id} ·{' '}
                    <span className="font-normal text-[#666666] tabular-nums">
                      {r.shift_date}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[12px] text-[#666666] tabular-nums">
                    {[
                      r.shift_type,
                      r.shift_name,
                      r.start_time && r.end_time ? `${r.start_time}–${r.end_time}` : null,
                      r.department,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Delete roster ${r.id}`}
                  onClick={() => void handleDeleteRoster(r.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-[#B91C1C] hover:bg-[#FEF2F2] cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </LinkedInSection>

      {/* Single Roster Upsert Modal */}
      {isRosterModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Assign duty roster"
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/45 md:p-4"
          onClick={() => setIsRosterModalOpen(false)}
        >
          <form
            onSubmit={handleCreateRoster}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] bg-white rounded-t-lg md:rounded-lg border border-[#E5E7EB] overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 h-13">
              <h3 className="text-[15px] font-semibold text-[#171717]">Assign roster entry</h3>
              <button
                type="button"
                aria-label="Close roster modal"
                onClick={() => setIsRosterModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-[#404040] hover:bg-[#F3F2EF] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {rosterError ? (
                <div
                  role="alert"
                  className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#B91C1C]"
                >
                  {rosterError}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="r-emp" className="block text-[12px] font-medium text-[#404040] mb-1">
                    Employee UUID *
                  </label>
                  <input
                    id="r-emp"
                    type="text"
                    required
                    value={rosterEmployeeId}
                    onChange={(e) => setRosterEmployeeId(e.target.value)}
                    placeholder="UUID"
                    className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px]"
                  />
                </div>
                <div>
                  <label htmlFor="r-date" className="block text-[12px] font-medium text-[#404040] mb-1">
                    Shift date *
                  </label>
                  <input
                    id="r-date"
                    type="date"
                    required
                    value={rosterDate}
                    onChange={(e) => setRosterDate(e.target.value)}
                    className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="r-type" className="block text-[12px] font-medium text-[#404040] mb-1">
                    Shift type
                  </label>
                  <select
                    id="r-type"
                    value={rosterShiftType}
                    onChange={(e) => setRosterShiftType(e.target.value as RosterType)}
                    className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px]"
                  >
                    {ROSTER_TYPES.map((rt) => (
                      <option key={rt} value={rt}>
                        {rt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="r-shift" className="block text-[12px] font-medium text-[#404040] mb-1">
                    Shift template (optional)
                  </label>
                  <select
                    id="r-shift"
                    value={rosterShiftId}
                    onChange={(e) => setRosterShiftId(e.target.value)}
                    className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px]"
                  >
                    <option value="">None</option>
                    {shiftOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="r-start" className="block text-[12px] font-medium text-[#404040] mb-1">
                    Custom start (HH:MM)
                  </label>
                  <input
                    id="r-start"
                    type="time"
                    value={rosterStartTime}
                    onChange={(e) => setRosterStartTime(e.target.value)}
                    className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px]"
                  />
                </div>
                <div>
                  <label htmlFor="r-end" className="block text-[12px] font-medium text-[#404040] mb-1">
                    Custom end (HH:MM)
                  </label>
                  <input
                    id="r-end"
                    type="time"
                    value={rosterEndTime}
                    onChange={(e) => setRosterEndTime(e.target.value)}
                    className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="r-notes" className="block text-[12px] font-medium text-[#404040] mb-1">
                  Notes
                </label>
                <input
                  id="r-notes"
                  type="text"
                  value={rosterNotes}
                  onChange={(e) => setRosterNotes(e.target.value)}
                  className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px]"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] px-4 py-3">
              <button
                type="button"
                onClick={() => setIsRosterModalOpen(false)}
                className="h-9 rounded-md border border-[#E5E7EB] bg-white px-4 text-[13px] font-medium text-[#171717]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingRoster}
                className="h-9 rounded-md bg-[#0A66C2] px-4 text-[13px] font-semibold text-white hover:bg-[#004182] disabled:opacity-50"
              >
                {isCreatingRoster ? 'Saving…' : 'Save entry'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Bulk Roster Modal (2,000-cell cap enforced) */}
      {isBulkModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Bulk assign rosters"
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/45 md:p-4"
          onClick={() => setIsBulkModalOpen(false)}
        >
          <form
            onSubmit={handleBulkRosterSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] bg-white rounded-t-lg md:rounded-lg border border-[#E5E7EB] overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 h-13">
              <h3 className="text-[15px] font-semibold text-[#171717]">
                Bulk roster assignment
              </h3>
              <button
                type="button"
                aria-label="Close bulk roster modal"
                onClick={() => setIsBulkModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-[#404040] hover:bg-[#F3F2EF] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-[12px] text-[#666666]">
                Server enforces a maximum of 2,000 assignments (employees × inclusive dates).
              </p>
              {bulkError ? (
                <div
                  role="alert"
                  className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#B91C1C]"
                >
                  {bulkError}
                </div>
              ) : null}

              <div>
                <label htmlFor="bulk-emps" className="block text-[12px] font-medium text-[#404040] mb-1">
                  Employee UUIDs (comma or newline separated) *
                </label>
                <textarea
                  id="bulk-emps"
                  required
                  rows={2}
                  value={bulkEmployeeIdsText}
                  onChange={(e) => setBulkEmployeeIdsText(e.target.value)}
                  placeholder="uuid-1, uuid-2"
                  className="w-full rounded-md border border-[#E5E7EB] p-2.5 text-[12px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="bulk-start" className="block text-[12px] font-medium text-[#404040] mb-1">
                    Start date *
                  </label>
                  <input
                    id="bulk-start"
                    type="date"
                    required
                    value={bulkStartDate}
                    onChange={(e) => setBulkStartDate(e.target.value)}
                    className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px]"
                  />
                </div>
                <div>
                  <label htmlFor="bulk-end" className="block text-[12px] font-medium text-[#404040] mb-1">
                    End date *
                  </label>
                  <input
                    id="bulk-end"
                    type="date"
                    required
                    value={bulkEndDate}
                    onChange={(e) => setBulkEndDate(e.target.value)}
                    className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="bulk-type" className="block text-[12px] font-medium text-[#404040] mb-1">
                    Shift type
                  </label>
                  <select
                    id="bulk-type"
                    value={bulkShiftType}
                    onChange={(e) => setBulkShiftType(e.target.value as RosterType)}
                    className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px]"
                  >
                    {ROSTER_TYPES.map((rt) => (
                      <option key={rt} value={rt}>
                        {rt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="bulk-shift" className="block text-[12px] font-medium text-[#404040] mb-1">
                    Shift template
                  </label>
                  <select
                    id="bulk-shift"
                    value={bulkShiftId}
                    onChange={(e) => setBulkShiftId(e.target.value)}
                    className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px]"
                  >
                    <option value="">None</option>
                    {shiftOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] px-4 py-3">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="h-9 rounded-md border border-[#E5E7EB] bg-white px-4 text-[13px] font-medium text-[#171717]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBulkCreating}
                className="h-9 rounded-md bg-[#0A66C2] px-4 text-[13px] font-semibold text-white hover:bg-[#004182] disabled:opacity-50"
              >
                {isBulkCreating ? 'Assigning…' : 'Apply bulk roster'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
