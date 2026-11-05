'use client';

import React, { useState } from 'react';
import { HelpDeskAnnouncement } from '@/lib/helpdesk-types';
import {
  Megaphone,
  AlertTriangle,
  Bell,
  Calendar,
  Plus,
  X,
  CheckCircle,
} from 'lucide-react';

interface HelpDeskAnnouncementsViewProps {
  announcements: HelpDeskAnnouncement[];
  canEdit: boolean;
  onSuccessToast: (msg: string) => void;
}

export function HelpDeskAnnouncementsView({
  announcements: initialAnnouncements,
  canEdit,
  onSuccessToast,
}: HelpDeskAnnouncementsViewProps) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [newModal, setNewModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'Urgent' | 'High' | 'Normal'>('Normal');
  const [expiryDate, setExpiryDate] = useState('2026-11-20');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newObj: HelpDeskAnnouncement = {
      id: `HDA-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      priority,
      postedDate: new Date().toISOString().split('T')[0],
      expiryDate,
      author: 'HR Support Desk',
      targetAudience: 'All Employees',
    };

    setAnnouncements((prev) => [newObj, ...prev]);
    onSuccessToast(`Support broadcast "${title}" issued across enterprise portal.`);
    setNewModal(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-4" data-testid="helpdesk-announcements-view">
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Support Desk Bulletins &amp; Maintenance Broadcasts
          </h2>
          <p className="text-xs text-slate-500">
            Organization-wide system alerts, payroll deadlines &amp; holiday support schedules
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => setNewModal(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Post Bulletin</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-2">
            <Megaphone className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">No active announcements</p>
            <p className="text-xs text-slate-500">There are no operational or system bulletins posted right now.</p>
          </div>
        ) : (
          announcements.map((ann) => (
          <div
            key={ann.id}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    ann.priority === 'Urgent'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200'
                      : ann.priority === 'High'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  }`}
                >
                  {ann.priority} Priority
                </span>
                <span className="font-mono text-slate-400">Audience: {ann.targetAudience}</span>
              </div>
              <span className="font-mono text-slate-500">Expires: {ann.expiryDate}</span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{ann.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {ann.content}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Posted by: {ann.author}</span>
              <span>Published: {ann.postedDate}</span>
            </div>
          </div>
        )))}
      </div>

      {newModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Post Support Broadcast
              </h3>
              <button
                type="button"
                onClick={() => setNewModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. November Tax Proof Verification Window..."
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Broadcast Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'Urgent' | 'High' | 'Normal')}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent Banner</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Bulletin Notice Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Details, cutoff timings, action required..."
                  rows={4}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewModal(false)}
                  className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                >
                  Broadcast Bulletin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
