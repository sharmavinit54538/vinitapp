'use client';

import React, { useState } from 'react';
import {
  CalendarCheck,
  Clock,
  ScanFace,
  UserCheck,
  UserMinus,
  X,
} from 'lucide-react';
import {
  HrDashboardDataState,
  calculateAttendancePercentages,
} from '@/lib/hr-dashboard-logic';
import { useRecordFaceAttendanceMutation } from '@/lib/store/hr-api';
import {
  LinkedInEmptyState,
  LinkedInSection,
} from '@/src/components/linkedin/LinkedInPrimitives';

interface AttendanceScreenProps {
  data: HrDashboardDataState;
  isDark: boolean;
  onSuccessToast: (msg: string) => void;
}

const PUNCH_TYPES = ['Check-In', 'Late Check-In', 'Check-Out'] as const;

export function AttendanceScreen({
  data,
  onSuccessToast,
}: AttendanceScreenProps) {
  const [recordFaceAttendance, { isLoading }] = useRecordFaceAttendanceMutation();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [employeeName, setEmployeeName] = useState(data.adminProfile.name);
  const [employeeId, setEmployeeId] = useState(data.adminProfile.employeeId);
  const [department, setDepartment] = useState(data.adminProfile.department);
  const [punchType, setPunchType] = useState<(typeof PUNCH_TYPES)[number]>('Check-In');
  const [formError, setFormError] = useState<string | null>(null);

  const stats = calculateAttendancePercentages(data.kpis.attendance);
  const faceLogs = data.faceAttendanceLogs || [];

  const handleFaceVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!employeeName.trim() || !employeeId.trim()) {
      setFormError('Employee name and ID are required.');
      return;
    }

    try {
      await recordFaceAttendance({
        employeeName: employeeName.trim(),
        employeeId: employeeId.trim(),
        department: department.trim() || 'Operations',
        punchType,
        location: data.adminProfile.location || 'Primary Office',
      }).unwrap();
      onSuccessToast(`Biometric ${punchType} recorded for ${employeeName.trim()}`);
      setIsScannerOpen(false);
    } catch {
      setFormError('Unable to record biometric attendance. Please try again.');
    }
  };

  return (
    <div className="flex flex-col gap-2 md:gap-3">
      {/* Face Attendance Check-In Section */}
      <LinkedInSection>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4">
          <div className="min-w-0">
            <h1 className="text-[16px] font-semibold text-[#171717] tracking-[-0.01em]">
              Attendance & check-in
            </h1>
            <p className="mt-0.5 text-[13px] text-[#666666]">
              Facial verification and geofenced punch logging
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setIsScannerOpen(true);
            }}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-[#0A66C2] px-4 text-[13px] font-semibold text-white hover:bg-[#004182] transition-colors cursor-pointer"
          >
            <ScanFace className="h-4 w-4" strokeWidth={1.9} />
            Launch scanner
          </button>
        </div>

        {/* Compact 2x2 Thin-Bordered Attendance Summary Grid */}
        <div className="grid grid-cols-2 border-t border-[#E5E7EB]">
          <div className="flex flex-col justify-between p-4 border-r border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2 text-[#666666]">
              <UserCheck className="h-4 w-4 text-[#404040] shrink-0" strokeWidth={1.85} />
              <span className="text-[12px] font-medium">Present</span>
            </div>
            <p className="mt-2 text-[22px] font-semibold text-[#15803D] tabular-nums">
              {data.kpis.attendance.present}
            </p>
            <p className="text-[11px] text-[#666666] tabular-nums">{stats.presentPct}% of logged</p>
          </div>

          <div className="flex flex-col justify-between p-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2 text-[#666666]">
              <Clock className="h-4 w-4 text-[#404040] shrink-0" strokeWidth={1.85} />
              <span className="text-[12px] font-medium">Late check-in</span>
            </div>
            <p className="mt-2 text-[22px] font-semibold text-[#B45309] tabular-nums">
              {data.kpis.attendance.late}
            </p>
            <p className="text-[11px] text-[#666666] tabular-nums">{stats.latePct}% of logged</p>
          </div>

          <div className="flex flex-col justify-between p-4 border-r border-[#E5E7EB]">
            <div className="flex items-center gap-2 text-[#666666]">
              <CalendarCheck className="h-4 w-4 text-[#404040] shrink-0" strokeWidth={1.85} />
              <span className="text-[12px] font-medium">On leave</span>
            </div>
            <p className="mt-2 text-[22px] font-semibold text-[#171717] tabular-nums">
              {data.kpis.attendance.onLeave}
            </p>
            <p className="text-[11px] text-[#666666]">Approved leaves</p>
          </div>

          <div className="flex flex-col justify-between p-4">
            <div className="flex items-center gap-2 text-[#666666]">
              <UserMinus className="h-4 w-4 text-[#404040] shrink-0" strokeWidth={1.85} />
              <span className="text-[12px] font-medium">Absent</span>
            </div>
            <p className="mt-2 text-[22px] font-semibold text-[#B91C1C] tabular-nums">
              {data.kpis.attendance.absent}
            </p>
            <p className="text-[11px] text-[#666666]">Unscheduled</p>
          </div>
        </div>
      </LinkedInSection>

      {/* Biometric Check-In Logs */}
      <LinkedInSection>
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#E5E7EB]">
          <h2 className="text-[15px] font-semibold text-[#171717]">
            Biometric check-in logs
          </h2>
          <span className="text-[12px] text-[#666666] tabular-nums">
            {faceLogs.length} {faceLogs.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {faceLogs.length === 0 ? (
          <LinkedInEmptyState
            title="No biometric punches today"
            subtitle="Use Launch scanner above to record a face verification check-in."
            variant="neutral"
          />
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {faceLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-3 px-4 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-[#171717]">
                    {log.employeeName}{' '}
                    <span className="font-normal text-[#666666] tabular-nums">
                      · {log.employeeId}
                    </span>
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-[#666666] tabular-nums">
                    {log.department} · {log.timestamp} · {log.location}
                  </p>
                </div>
                <span className="shrink-0 text-[12px] font-semibold text-[#15803D] tabular-nums">
                  {log.punchType} · {log.confidenceScore}%
                </span>
              </div>
            ))}
          </div>
        )}
      </LinkedInSection>

      {/* Face Attendance Scanner Modal */}
      {isScannerOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Face Attendance Check-In"
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/45 md:p-4"
          onClick={() => setIsScannerOpen(false)}
        >
          <form
            onSubmit={handleFaceVerify}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[480px] bg-white rounded-t-lg md:rounded-lg border border-[#E5E7EB] overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 h-14 shrink-0">
              <div>
                <h2 className="text-[15px] font-semibold text-[#171717]">
                  Face attendance check-in
                </h2>
                <p className="text-[12px] text-[#666666]">
                  Biometric verification & punch capture
                </p>
              </div>
              <button
                type="button"
                aria-label="Close scanner"
                onClick={() => setIsScannerOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-[#404040] hover:bg-[#F3F2EF] cursor-pointer"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="overflow-y-auto px-4 py-4 space-y-3.5">
              <div className="flex flex-col items-center justify-center rounded-md border border-[#E5E7EB] bg-[#171717] py-6 px-4 text-center">
                <div className="flex h-20 w-36 items-center justify-center rounded-md border border-dashed border-[#15803D]">
                  <span className="text-[12px] font-semibold text-[#22C55E] tabular-nums">
                    Liveness ready
                  </span>
                </div>
                <p className="mt-2.5 text-[12px] text-[#A3A3A3]">
                  Position face inside the frame to confirm punch
                </p>
              </div>

              {formError ? (
                <div
                  role="alert"
                  className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[12px] font-medium text-[#B91C1C]"
                >
                  {formError}
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="face-emp-name"
                  className="block text-[12px] font-medium text-[#404040] mb-1"
                >
                  Employee name
                </label>
                <input
                  id="face-emp-name"
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] focus:border-[#0A66C2] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="face-emp-id"
                    className="block text-[12px] font-medium text-[#404040] mb-1"
                  >
                    Employee ID
                  </label>
                  <input
                    id="face-emp-id"
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] tabular-nums focus:border-[#0A66C2] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="face-dept"
                    className="block text-[12px] font-medium text-[#404040] mb-1"
                  >
                    Department
                  </label>
                  <input
                    id="face-dept"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] focus:border-[#0A66C2] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <span className="block text-[12px] font-medium text-[#404040] mb-1.5">
                  Punch type
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {PUNCH_TYPES.map((pt) => {
                    const active = punchType === pt;
                    return (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => setPunchType(pt)}
                        className={`h-9 rounded-md border text-[12px] font-medium transition-colors cursor-pointer ${
                          active
                            ? 'border-[#0A66C2] bg-[#EFF6FF] text-[#0A66C2] font-semibold'
                            : 'border-[#E5E7EB] bg-white text-[#666666] hover:bg-[#F3F2EF]'
                        }`}
                      >
                        {pt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] px-4 py-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsScannerOpen(false)}
                className="h-9 rounded-md border border-[#E5E7EB] bg-white px-4 text-[13px] font-medium text-[#171717] hover:bg-[#F3F2EF] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="h-9 rounded-md bg-[#0A66C2] px-4 text-[13px] font-semibold text-white hover:bg-[#004182] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Verifying...' : `Verify & ${punchType}`}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
