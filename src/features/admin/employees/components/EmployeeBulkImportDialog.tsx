'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/src/components/ui';
import {
  AdminEmployeeFormValues,
  parseEmployeesCsv,
} from '../employeesThunk';

export interface EmployeeBulkImportDialogProps {
  open: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onBulkImport: (rows: AdminEmployeeFormValues[]) => Promise<void>;
}

const SAMPLE_EMPLOYEES_CSV = `firstName,lastName,officialEmail,mobileNumber,employeeCode,department,designation,systemRole
Ananya,Iyer,ananya.iyer@ofc360.com,+91 98201 77881,EMP-201,Engineering,Staff Frontend Engineer,Employee
Devansh,Kapoor,devansh.kapoor@ofc360.com,+91 98201 77882,EMP-202,People Operations,HR Operations Lead,Manager
Siddharth,Menon,siddharth.menon@ofc360.com,+91 98201 77883,EMP-203,Engineering,Principal Cloud Architect,IT-Admin`;

export function EmployeeBulkImportDialog({
  open,
  onClose,
  isSubmitting,
  onBulkImport,
}: EmployeeBulkImportDialogProps) {
  const [csvContent, setCsvContent] = useState(SAMPLE_EMPLOYEES_CSV);
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  if (!open) return null;

  const parsedPreview = parseEmployeesCsv(csvContent);

  const handleDownloadSample = () => {
    if (typeof window === 'undefined') return;
    const blob = new Blob([SAMPLE_EMPLOYEES_CSV], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ofc360-employees-sample.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.success('Sample Employees CSV template downloaded.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCsvContent(reader.result);
        setParseErrors([]);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const { validRows, errors } = parseEmployeesCsv(csvContent);
    setParseErrors(errors);
    if (validRows.length === 0) {
      toast.error('No valid employee rows found in CSV.');
      return;
    }

    try {
      await onBulkImport(validRows);
      toast.success(
        `Bulk enrolled ${validRows.length} employees & dispatched onboarding invites!`
      );
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Bulk employee import failed'
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-import-employees-title"
      data-testid="employee-bulk-import-dialog"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="bulk-import-employees-title"
                className="text-sm font-bold text-slate-900"
              >
                Bulk Import Workforce Employees (CSV / Excel)
              </h3>
              <p className="text-xs text-slate-500">
                Download sample template or upload CSV to enroll multiple
                employees with roles
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Employee Bulk Import dialog"
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="font-mono text-[11px] font-semibold text-slate-700">
              firstName, lastName, officialEmail, mobileNumber, employeeCode,
              department, designation, systemRole
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadSample}
              >
                <Download className="h-3.5 w-3.5" />
                Sample CSV
              </Button>
              <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700">
                <Upload className="h-3.5 w-3.5" />
                Upload CSV
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          <textarea
            rows={5}
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-950 p-3 font-mono text-xs text-emerald-300"
          />

          {parseErrors.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {parseErrors.map((err, idx) => (
                <p key={idx}>{err}</p>
              ))}
            </div>
          )}

          {parsedPreview.validRows.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedPreview.validRows.map((row) => (
                    <tr key={row.employeeCode}>
                      <td className="px-3 py-2 font-mono font-bold text-indigo-600">
                        {row.employeeCode}
                      </td>
                      <td className="px-3 py-2 font-semibold text-slate-900">
                        {row.firstName} {row.lastName}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {row.officialEmail}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {row.department}
                      </td>
                      <td className="px-3 py-2 font-bold text-emerald-700">
                        {row.systemRole}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={isSubmitting || parsedPreview.validRows.length === 0}
              onClick={() => void handleImport()}
              data-testid="confirm-bulk-import-emp-btn"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                `Import ${parsedPreview.validRows.length} Employees`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
