'use client';

import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Building2,
  FileSpreadsheet,
  GitBranch,
  Plus,
  Search,
  Users,
  Wallet,
} from 'lucide-react';
import { AppDispatch, RootState } from '@/lib/store';
import { Button, Card, Input } from '@/src/components/ui';
import {
  bulkImportDepartmentsThunk,
  CreateDepartmentPayload,
  createDepartmentThunk,
} from '../departmentsThunk';
import { DepartmentFormDialog } from './DepartmentFormDialog';
import { ImportDialog } from './ImportDialog';

export function DepartmentsDirectoryTab() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: departments, submitting } = useSelector(
    (state: RootState) => state.adminDepartments
  );
  const { items: employees } = useSelector(
    (state: RootState) => state.adminEmployees
  );

  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const filteredDepartments = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.managerName.toLowerCase().includes(q) ||
        (d.parentDepartmentName || '').toLowerCase().includes(q)
    );
  }, [departments, search]);

  const employeeOptions = useMemo(
    () =>
      employees.map((e) => ({
        id: e.id,
        fullName: e.fullName,
        designation: e.designation,
      })),
    [employees]
  );

  const handleCreateDepartment = async (payload: CreateDepartmentPayload) => {
    await dispatch(createDepartmentThunk(payload)).unwrap();
  };

  const handleBulkImport = async (rows: CreateDepartmentPayload[]) => {
    await dispatch(bulkImportDepartmentsThunk(rows)).unwrap();
  };

  return (
    <div className="space-y-4" data-testid="departments-directory-tab">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Organization Departments &amp; Hierarchy ({departments.length})
          </h3>
          <p className="text-xs text-slate-500">
            Manage parent-child department hierarchy, department heads, budgets,
            and headcount limits
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-56">
            <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search name, code, head..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setIsImportOpen(true)}
            data-testid="open-dept-bulk-import-btn"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Bulk Import CSV
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => setIsAddOpen(true)}
            data-testid="open-add-department-btn"
          >
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDepartments.map((dept) => {
          const utilizationPct = Math.min(
            100,
            Math.round(
              (dept.activeHeadcount / Math.max(1, dept.headcountLimit)) * 100
            )
          );
          return (
            <Card key={dept.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {dept.name}
                        </h4>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-700">
                          {dept.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Head: <span className="font-semibold">{dept.managerName}</span>
                      </p>
                    </div>
                  </div>

                  {dept.parentDepartmentName ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-700">
                      <GitBranch className="h-3 w-3" />
                      {dept.parentDepartmentName}
                    </span>
                  ) : (
                    <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                      Root Unit
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xs text-slate-600">
                  {dept.description}
                </p>
              </div>

              <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <Users className="h-3.5 w-3.5" />
                    Headcount: {dept.activeHeadcount} / {dept.headcountLimit}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono font-semibold text-slate-700">
                    <Wallet className="h-3.5 w-3.5 text-slate-400" />₹
                    {dept.budget.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600"
                    style={{ width: `${utilizationPct}%` }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <DepartmentFormDialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        existingDepartments={departments}
        employeeOptions={employeeOptions}
        isSubmitting={submitting}
        onSubmitDepartment={handleCreateDepartment}
      />

      <ImportDialog
        open={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        isSubmitting={submitting}
        onBulkImport={handleBulkImport}
      />
    </div>
  );
}
