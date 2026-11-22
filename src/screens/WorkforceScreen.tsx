'use client';

import React, { useMemo, useState } from 'react';
import { Building2, Network, Plus, UserPlus, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'sonner';
import { AppDispatch, RootState } from '@/lib/store';
import {
  WorkforceEmployee,
  DepartmentAttendanceMetric,
} from '@/lib/hr-dashboard-logic';
import { EmployeesTable } from '@/src/features/admin/employees/components/EmployeesTable';
import { DepartmentsDirectoryTab } from '@/src/features/admin/departments/components/DepartmentsDirectoryTab';
import { EmployeeFormDialog } from '@/src/features/admin/employees/components/EmployeeFormDialog';
import {
  AdminEmployeeFormValues,
  createAdminEmployeeThunk,
} from '@/src/features/admin/employees/employeesThunk';
import { DepartmentFormDialog } from '@/src/features/admin/departments/components/DepartmentFormDialog';
import {
  CreateDepartmentPayload,
  createDepartmentThunk,
} from '@/src/features/admin/departments/departmentsThunk';
import {
  LinkedInEmptyState,
  LinkedInSection,
  LinkedInTopTabs,
} from '@/src/components/linkedin/LinkedInPrimitives';

interface WorkforceScreenProps {
  workforce: WorkforceEmployee[];
  departments: DepartmentAttendanceMetric[];
  isDark: boolean;
  canManage: boolean;
  onOpenAddEmployee: () => void;
  onSuccessToast: (msg: string) => void;
}

type WorkforceSubView = 'Employee' | 'Department' | 'Org Chart';

const WORKFORCE_TABS: { id: WorkforceSubView; label: string }[] = [
  { id: 'Employee', label: 'Employees' },
  { id: 'Department', label: 'Departments' },
  { id: 'Org Chart', label: 'Org chart' },
];

export function WorkforceScreen({
  workforce,
  canManage,
}: WorkforceScreenProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { items: adminEmployees, submitting: empSubmitting } = useSelector(
    (state: RootState) => state.adminEmployees
  );
  const { items: adminDepartments, submitting: deptSubmitting } = useSelector(
    (state: RootState) => state.adminDepartments
  );

  const [subView, setSubView] = useState<WorkforceSubView>('Employee');
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [isAddDepartmentDialogOpen, setIsAddDepartmentDialogOpen] = useState(false);

  const departmentOptions = useMemo(
    () => adminDepartments.map((d) => d.name),
    [adminDepartments]
  );

  const managerOptions = useMemo(
    () => adminEmployees.map((e) => e.fullName),
    [adminEmployees]
  );

  const employeeOptions = useMemo(
    () =>
      adminEmployees.map((e) => ({
        id: e.id,
        fullName: e.fullName,
        designation: e.designation,
      })),
    [adminEmployees]
  );

  const handleCreateEmployee = async (payload: AdminEmployeeFormValues) => {
    await dispatch(createAdminEmployeeThunk(payload)).unwrap();
    setSubView('Employee');
  };

  const handleCreateDepartment = async (payload: CreateDepartmentPayload) => {
    await dispatch(createDepartmentThunk(payload)).unwrap();
    setSubView('Department');
  };

  const combinedPeopleCount = Math.max(workforce.length, adminEmployees.length);

  return (
    <div className="flex flex-col gap-2 md:gap-3">
      <Toaster position="top-right" richColors />

      <LinkedInSection>
        <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
          <div className="min-w-0">
            <h1 className="text-[16px] font-semibold text-[#171717] tracking-[-0.01em]">
              People directory
            </h1>
            <p className="text-[12px] text-[#666666] mt-0.5 tabular-nums">
              {combinedPeopleCount} {combinedPeopleCount === 1 ? 'member' : 'members'} · {adminDepartments.length}{' '}
              {adminDepartments.length === 1 ? 'department' : 'departments'}
            </p>
          </div>

          {canManage ? (
            <button
              type="button"
              onClick={() => setIsAddDropdownOpen(true)}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-[#0A66C2] px-3.5 text-[13px] font-semibold text-white hover:bg-[#004182] transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" strokeWidth={2.2} />
              Add
            </button>
          ) : null}
        </div>

        <LinkedInTopTabs
          tabs={WORKFORCE_TABS}
          activeTab={subView}
          onSelect={setSubView}
          ariaLabel="Workforce sections"
        />

        {subView === 'Employee' ? (
          <div className="p-4">
            <EmployeesTable />
          </div>
        ) : null}

        {subView === 'Department' ? (
          <div className="p-4">
            <DepartmentsDirectoryTab />
          </div>
        ) : null}

        {subView === 'Org Chart' ? (
          <div className="p-4">
            {workforce.length === 0 && adminEmployees.length === 0 ? (
              <LinkedInEmptyState
                title="No reporting hierarchy yet"
                subtitle="Add employees and departments to populate the organization chart."
                variant="neutral"
              />
            ) : (
              <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-md">
                {(workforce.length > 0 ? workforce : adminEmployees).map((person) => {
                  const displayName = 'name' in person ? person.name : person.fullName;
                  const empCode = 'employeeId' in person ? person.employeeId : person.employeeCode;
                  return (
                    <div
                      key={person.id}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#F3F2EF] text-[#404040]">
                          <Network className="h-4 w-4" strokeWidth={1.85} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-semibold text-[#171717]">
                            {displayName}
                          </p>
                          <p className="truncate text-[12px] text-[#666666]">
                            {person.designation} · {person.department}
                          </p>
                        </div>
                      </div>
                      <span className="text-[12px] text-[#666666] tabular-nums shrink-0">
                        {empCode}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}
      </LinkedInSection>

      {/* Add Menu Modal */}
      {isAddDropdownOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add to workforce"
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/45 md:p-4"
          onClick={() => setIsAddDropdownOpen(false)}
        >
          <div
            className="w-full max-w-[440px] bg-white rounded-t-lg md:rounded-lg border border-[#E5E7EB] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 h-13">
              <h2 className="text-[15px] font-semibold text-[#171717]">
                Add to organization
              </h2>
              <button
                type="button"
                aria-label="Close add menu"
                onClick={() => setIsAddDropdownOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-[#404040] hover:bg-[#F3F2EF] cursor-pointer"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <div className="divide-y divide-[#E5E7EB]">
              <button
                type="button"
                onClick={() => {
                  setIsAddDropdownOpen(false);
                  setIsAddEmployeeDialogOpen(true);
                }}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-[#F3F2EF] transition-colors cursor-pointer"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#F3F2EF] text-[#404040]">
                  <UserPlus className="h-4 w-4" strokeWidth={1.85} />
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-[#171717]">Add employee</p>
                  <p className="text-[12px] text-[#666666]">
                    Create a new employee profile and role assignment
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAddDropdownOpen(false);
                  setIsAddDepartmentDialogOpen(true);
                }}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-[#F3F2EF] transition-colors cursor-pointer"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#F3F2EF] text-[#404040]">
                  <Building2 className="h-4 w-4" strokeWidth={1.85} />
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-[#171717]">Add department</p>
                  <p className="text-[12px] text-[#666666]">
                    Configure a new department and assign a head
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <EmployeeFormDialog
        open={isAddEmployeeDialogOpen}
        onClose={() => setIsAddEmployeeDialogOpen(false)}
        departmentOptions={departmentOptions}
        managerOptions={managerOptions}
        nextEmployeeCode={`EMP-${100 + adminEmployees.length + 1}`}
        isSubmitting={empSubmitting}
        onSubmitEmployee={handleCreateEmployee}
      />

      <DepartmentFormDialog
        open={isAddDepartmentDialogOpen}
        onClose={() => setIsAddDepartmentDialogOpen(false)}
        existingDepartments={adminDepartments}
        employeeOptions={employeeOptions}
        isSubmitting={deptSubmitting}
        onSubmitDepartment={handleCreateDepartment}
      />
    </div>
  );
}
