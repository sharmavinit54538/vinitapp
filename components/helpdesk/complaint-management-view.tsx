'use client';

import React, { useState } from 'react';
import {
  ConfidentialComplaintItem,
  canAccessConfidentialComplaint,
} from '@/lib/helpdesk-types';
import { Ofc360Role } from '@/lib/auth-schemas';
import {
  ShieldAlert,
  Lock,
  Plus,
  EyeOff,
  UserCheck,
  FileText,
  AlertTriangle,
  CheckCircle,
  Paperclip,
  Clock,
  ShieldCheck,
  X,
  Send,
} from 'lucide-react';

interface ComplaintManagementViewProps {
  complaints: ConfidentialComplaintItem[];
  activeRole: Ofc360Role;
  onSubmitComplaint: (complaint: Partial<ConfidentialComplaintItem>) => Promise<void>;
  onAddNote: (complaintId: string, note: string) => Promise<void>;
  onSuccessToast: (msg: string) => void;
}

export function ComplaintManagementView({
  complaints,
  activeRole,
  onSubmitComplaint,
  onAddNote,
  onSuccessToast,
}: ComplaintManagementViewProps) {
  const [selectedComplaint, setSelectedComplaint] = useState<ConfidentialComplaintItem | null>(null);
  const [newNote, setNewNote] = useState('');
  const [newComplaintModalOpen, setNewComplaintModalOpen] = useState(false);

  // New complaint form state
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [category, setCategory] = useState<ConfidentialComplaintItem['category']>('Ethics & Fraud');
  const [subject, setSubject] = useState('');
  const [detailedStatement, setDetailedStatement] = useState('');
  const [evidenceCount, setEvidenceCount] = useState(1);

  const hasAccess = canAccessConfidentialComplaint(activeRole);

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !detailedStatement.trim()) return;

    try {
      await onSubmitComplaint({
        isAnonymous,
        category,
        subject: subject.trim(),
        detailedStatement: detailedStatement.trim(),
        evidenceCount,
      });
      onSuccessToast('Confidential grievance encrypted and submitted under ICC protection.');
      setNewComplaintModalOpen(false);
      setSubject('');
      setDetailedStatement('');
    } catch {
      onSuccessToast('Failed to submit complaint.');
    }
  };

  const handlePostNote = async () => {
    if (!selectedComplaint || !newNote.trim()) return;
    try {
      await onAddNote(selectedComplaint.id, newNote.trim());
      onSuccessToast('Confidential investigation note logged.');
      setNewNote('');
    } catch {
      onSuccessToast('Failed to add note.');
    }
  };

  // If role is employee or manager, show restricted access notice with anonymous reporting capability
  if (!hasAccess) {
    return (
      <div className="p-8 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 text-center space-y-4 max-w-xl mx-auto shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Restricted Confidential Access
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Grievance investigation files are strictly restricted to the Super Admin and the Internal Complaints Committee (ICC) under statutory whistleblowing regulations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNewComplaintModalOpen(true)}
          className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>File a Confidential / Anonymous Complaint</span>
        </button>

        {/* Modal for non-admin submission */}
        {newComplaintModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 text-left">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Submit Confidential Grievance
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setNewComplaintModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateComplaint} className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-indigo-950 dark:text-indigo-200">
                      Submit Anonymously
                    </p>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                      Your name, employee ID, and contact details will not be stored.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Grievance Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ConfidentialComplaintItem['category'])}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="POSH">POSH (Prevention of Sexual Harassment)</option>
                    <option value="Ethics & Fraud">Ethics, Bribery &amp; Procurement Fraud</option>
                    <option value="Workplace Harassment">Workplace Harassment &amp; Bullying</option>
                    <option value="Discrimination">Discrimination &amp; Equal Opportunity</option>
                    <option value="Manager Misconduct">Manager Misconduct</option>
                    <option value="Other Confidential">Other Confidential</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Grievance Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of issue..."
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Detailed Factual Statement
                  </label>
                  <textarea
                    value={detailedStatement}
                    onChange={(e) => setDetailedStatement(e.target.value)}
                    placeholder="Describe specific occurrences, approximate dates, locations, and personnel involved..."
                    rows={4}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setNewComplaintModalOpen(false)}
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Submit Confidential Case
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Admin View: Full Case Management
  return (
    <div className="space-y-4" data-testid="complaint-management-view">
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Confidential Whistleblower &amp; POSH Redressal Hub
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Encrypted vault accessible to Super Admin &amp; Internal Complaints Committee (ICC)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNewComplaintModalOpen(true)}
          className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Case</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Complaints Case List (col-span-7) */}
        <div className="lg:col-span-7 space-y-3">
          {complaints.length === 0 ? (
            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs text-center space-y-2">
              <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">No confidential complaints registered</p>
              <p className="text-xs text-slate-500">The grievance queue is currently clear. Click &quot;Log New Case&quot; to initiate a confidential inquiry.</p>
            </div>
          ) : (
            complaints.map((c) => {
            const isSelected = selectedComplaint?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedComplaint(c)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs space-y-3 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 ring-1 ring-indigo-600'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-600">{c.complaintNumber}</span>
                    {c.isAnonymous ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 inline-flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> Anonymous
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {c.complainantName}
                      </span>
                    )}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200">
                    {c.status}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-rose-600 block uppercase tracking-wider">
                    {c.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {c.subject}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    {c.detailedStatement}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Phase: {c.investigationPhase}</span>
                  <span>Investigator: {c.assignedInvestigator}</span>
                </div>
              </div>
            );
          }))}
        </div>

        {/* Selected Complaint Investigation Workspace (col-span-5) */}
        <div className="lg:col-span-5">
          {selectedComplaint ? (
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="font-mono text-xs font-bold text-rose-600">
                    {selectedComplaint.complaintNumber}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Investigation Ledger
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {selectedComplaint.evidenceCount} Evidences
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px]">Primary Statement</span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                    {selectedComplaint.detailedStatement}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white text-xs block">
                    Confidential Investigation Log ({selectedComplaint.investigationNotes.length})
                  </span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {selectedComplaint.investigationNotes.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-amber-50/40 dark:bg-amber-950/20 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                          <span>{n.author}</span>
                          <span>{n.timestamp}</span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200">{n.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Investigation Note */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Log legal deposition notes or evidence findings..."
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handlePostNote}
                    className="w-full h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Append Investigation Note
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              Select a grievance case from the ledger to inspect evidence timeline and investigator notes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
