'use client';

import React, { useState } from 'react';
import { EmployeeRequestItem } from '@/lib/helpdesk-types';
import { Ofc360Role } from '@/lib/auth-schemas';
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Plus,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  FileCheck,
} from 'lucide-react';

interface EmployeeRequestsViewProps {
  requests: EmployeeRequestItem[];
  activeRole: Ofc360Role;
  onActionRequest: (requestId: string, action: 'Approved' | 'Rejected' | 'Fulfilled', notes?: string) => Promise<void>;
  onSuccessToast: (msg: string) => void;
}

export function EmployeeRequestsView({
  requests,
  activeRole,
  onActionRequest,
  onSuccessToast,
}: EmployeeRequestsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedReq, setSelectedReq] = useState<EmployeeRequestItem | null>(null);
  const [actionNotes, setActionNotes] = useState('');

  const canApprove = activeRole === 'super_admin' || activeRole === 'hr_admin' || activeRole === 'manager';

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (typeFilter !== 'All' && r.requestType !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.requestNumber.toLowerCase().includes(q) ||
        r.employeeName.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        r.requestType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAction = async (action: 'Approved' | 'Rejected' | 'Fulfilled') => {
    if (!selectedReq) return;
    try {
      await onActionRequest(selectedReq.id, action, actionNotes);
      onSuccessToast(`Request ${selectedReq.requestNumber} successfully marked as ${action}.`);
      setSelectedReq(null);
      setActionNotes('');
    } catch {
      onSuccessToast('Failed to update request.');
    }
  };

  return (
    <div className="space-y-4" data-testid="employee-requests-view">
      {/* 1. TOP HEADER & FILTERS */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Employee HR Service Requests
            </h2>
            <p className="text-xs text-slate-500">
              Certificates, employment verifications, profile updates &amp; official letters
            </p>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
            {filteredRequests.length} Pending Actions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search request #, employee, document..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="All">All Request Types</option>
            <option value="Salary Certificate">Salary Certificate</option>
            <option value="Employment Verification">Employment Verification</option>
            <option value="Experience Letter">Experience Letter</option>
            <option value="Bank Account Update">Bank Account Update</option>
            <option value="Payslip Request">Payslip Request</option>
            <option value="Personal Information Update">Personal Info Update</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Fulfilled">Fulfilled</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* 2. REQUESTS QUEUE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRequests.length === 0 ? (
          <div className="md:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">No employee requests found</p>
            <p className="text-xs text-slate-500">No requests match the selected search or filter criteria.</p>
          </div>
        ) : (
          filteredRequests.map((req) => (
          <div
            key={req.id}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {req.requestNumber}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  req.status === 'Fulfilled' || req.status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : req.status === 'Rejected'
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {req.status}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                {req.requestType}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {req.subject}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{req.details}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between text-slate-500">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{req.employeeName}</p>
                <p className="text-[11px]">{req.department} · {req.submittedDate}</p>
              </div>

              <div className="flex items-center gap-1.5">
                {req.documentGeneratedUrl && (
                  <button
                    type="button"
                    onClick={() => onSuccessToast(`Downloaded verified ${req.requestType} PDF.`)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-slate-200 cursor-pointer"
                    title="Download Generated Certificate PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}

                {canApprove && req.status === 'Pending Review' && (
                  <button
                    type="button"
                    onClick={() => setSelectedReq(req)}
                    className="h-8 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    Review &amp; Action
                  </button>
                )}
              </div>
            </div>
          </div>
        )))}
      </div>

      {/* Action Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600">
                  {selectedReq.requestNumber}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Action: {selectedReq.requestType}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {selectedReq.employeeName} ({selectedReq.department})
              </p>
              <p className="text-slate-600 dark:text-slate-400">{selectedReq.details}</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Attestation &amp; Audit Notes
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Enter sign-off comments, verification stamps, or rejection reason..."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleAction('Rejected')}
                className="h-9 px-3.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-100 text-xs font-semibold cursor-pointer"
              >
                Reject Request
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAction('Approved')}
                  className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('Fulfilled')}
                  className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-sm"
                >
                  Approve &amp; Dispatch PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
