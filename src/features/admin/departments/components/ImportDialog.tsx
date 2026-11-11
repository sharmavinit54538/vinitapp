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
  CreateDepartmentPayload,
  parseDepartmentsCsv,
} from '../departmentsThunk';

export interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onBulkImport: (rows: CreateDepartmentPayload[]) => Promise<void>;
}

const SAMPLE_DEPARTMENTS_CSV = `name,code,parentDepartmentName,managerName,budget,headcountLimit,description
Product & Design,PRD,Engineering,Rohan Verma,420000,35,Product management and UX design studio
Enterprise Sales,SLS,,Aarav Sharma,600000,50,Global enterprise revenue and account growth
Quality Assurance,QAE,Engineering,Rohan Verma,210000,20,Automated testing and release reliability`;

export function ImportDialog({
  open,
  onClose,
  isSubmitting,
  onBulkImport,
}: ImportDialogProps) {
  const [csvContent, setCsvContent] = useState(SAMPLE_DEPARTMENTS_CSV);
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  if (!open) return null;

  const parsedPreview = parseDepartmentsCsv(csvContent);

  const handleDownloadSample = () => {
    if (typeof window === 'undefined') return;
    const blob = new Blob([SAMPLE_DEPARTMENTS_CSV], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ofc360-departments-sample.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.success('Sample Departments CSV template downloaded.');
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

  const handleImportSubmit = async () => {
    const { validRows, errors } = parseDepartmentsCsv(csvContent);
    setParseErrors(errors);
    if (validRows.length === 0) {
      toast.error('No valid department rows found to import.');
      return;
    }

    try {
      await onBulkImport(validRows);
      toast.success(
        `Successfully imported ${validRows.length} departments into directory!`
      );
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Bulk department import failed'
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-departments-dialog-title"
      data-testid="department-import-dialog"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="import-departments-dialog-title"
                className="text-sm font-bold text-slate-900"
              >
                Bulk Import Departments (CSV / Excel)
              </h3>
              <p className="text-xs text-slate-500">
                Download sample CSV format or upload/paste multiple departments
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Bulk Import dialog"
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-600">
              Columns:{' '}
              <span className="font-mono font-semibold text-slate-800">
                name, code, parentDepartmentName, managerName, budget,
                headcountLimit, description
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadSample}
              >
                <Download className="h-3.5 w-3.5" />
                Download Sample CSV
              </Button>
              <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700">
                <Upload className="h-3.5 w-3.5" />
                Upload CSV File
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="dept-csv-textarea"
              className="mb-1 block text-xs font-semibold text-slate-700"
            >
              CSV Payload Preview / Editor ({parsedPreview.validRows.length}{' '}
              valid rows ready)
            </label>
            <textarea
              id="dept-csv-textarea"
              rows={5}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-950 p-3 font-mono text-xs text-emerald-300"
            />
          </div>

          {parseErrors.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {parseErrors.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          )}

          {parsedPreview.validRows.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Parent</th>
                    <th className="px-3 py-2">Manager</th>
                    <th className="px-3 py-2 text-right">Headcount Cap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedPreview.validRows.map((row) => (
                    <tr key={row.code}>
                      <td className="px-3 py-2 font-semibold text-slate-900">
                        {row.name}
                      </td>
                      <td className="px-3 py-2 font-mono font-bold text-indigo-600">
                        {row.code}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {row.parentDepartmentName || 'Top-Level'}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {row.managerName}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {row.headcountLimit}
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
              onClick={() => void handleImportSubmit()}
              data-testid="confirm-bulk-import-dept-btn"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                `Import ${parsedPreview.validRows.length} Departments`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
