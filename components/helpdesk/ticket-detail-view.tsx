'use client';

import React, { useState } from 'react';
import {
  SupportTicket,
  SupportAgent,
  TicketMessage,
  TicketStatus,
  TicketPriority,
} from '@/lib/helpdesk-types';
import { Ofc360Role } from '@/lib/auth-schemas';
import {
  ArrowLeft,
  Clock,
  Send,
  Lock,
  User,
  Paperclip,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  XCircle,
  FileText,
  Mail,
  ShieldAlert,
  Sparkles,
  Download,
  AlertOctagon,
  ChevronRight,
} from 'lucide-react';

interface TicketDetailViewProps {
  ticket: SupportTicket;
  agents: SupportAgent[];
  activeRole: Ofc360Role;
  onBack: () => void;
  onSendMessage: (params: {
    ticketId: string;
    message: string;
    isInternalNote: boolean;
  }) => Promise<void>;
  onUpdateTicket: (params: {
    ticketId: string;
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedAgentId?: string;
    escalationLevel?: number;
  }) => Promise<void>;
  onSuccessToast: (msg: string) => void;
}

export function TicketDetailView({
  ticket,
  agents,
  activeRole,
  onBack,
  onSendMessage,
  onUpdateTicket,
  onSuccessToast,
}: TicketDetailViewProps) {
  const [activeReplyMode, setActiveReplyMode] = useState<'reply' | 'internal_note'>('reply');
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEmployeeRole = activeRole === 'employee';
  // If employee role, filter out internal notes completely!
  const visibleMessages = ticket.messages.filter(
    (m) => !isEmployeeRole || !m.isInternalNote
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await onSendMessage({
        ticketId: ticket.id,
        message: replyText.trim(),
        isInternalNote: activeReplyMode === 'internal_note',
      });
      setReplyText('');
      onSuccessToast(
        activeReplyMode === 'internal_note'
          ? 'Internal confidential note saved.'
          : 'Official reply delivered to employee.'
      );
    } catch {
      onSuccessToast('Failed to post reply.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    await onUpdateTicket({ ticketId: ticket.id, status });
    onSuccessToast(`Ticket marked as ${status}.`);
  };

  const handlePriorityChange = async (priority: TicketPriority) => {
    await onUpdateTicket({ ticketId: ticket.id, priority });
    onSuccessToast(`Priority updated to ${priority}.`);
  };

  const handleAssignAgent = async (agentId: string) => {
    await onUpdateTicket({ ticketId: ticket.id, assignedAgentId: agentId });
    const agent = agents.find((a) => a.id === agentId);
    onSuccessToast(`Assigned to ${agent?.name || 'Agent'}.`);
  };

  const handleEscalate = async () => {
    const nextLevel = (ticket.escalationLevel || 0) + 1;
    await onUpdateTicket({
      ticketId: ticket.id,
      escalationLevel: nextLevel,
      status: 'Escalated',
    });
    onSuccessToast(`Ticket escalated to Level ${nextLevel} Support Leadership.`);
  };

  return (
    <div className="space-y-4" data-testid="ticket-detail-workspace">
      {/* 1. TOP HEADER WITH BACK BUTTON & TICKET STATUS STRIP */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            data-testid="ticket-detail-back-btn"
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Tickets</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-indigo-600 dark:text-indigo-400">
                {ticket.ticketNumber}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  ticket.priority === 'Critical'
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200'
                    : ticket.priority === 'High'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                }`}
              >
                {ticket.priority}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {ticket.status}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {ticket.subject}
            </h2>
          </div>
        </div>

        {/* Quick Lifecycle Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {ticket.status !== 'Resolved' && (
            <button
              type="button"
              onClick={() => handleStatusChange('Resolved')}
              className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Resolve Ticket</span>
            </button>
          )}

          {ticket.status === 'Resolved' && (
            <button
              type="button"
              onClick={() => handleStatusChange('In Progress')}
              className="h-8 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reopen Ticket</span>
            </button>
          )}

          {ticket.status !== 'Closed' && (
            <button
              type="button"
              onClick={() => handleStatusChange('Closed')}
              className="h-8 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleEscalate}
            className="h-8 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Escalate</span>
          </button>
        </div>
      </div>

      {/* 2. 3-PANEL ENTERPRISE TICKET WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT PANEL: Ticket & Employee Meta (col-span-3) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Employee Information Card */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Requester Profile
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm shrink-0">
                {ticket.employeeName.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {ticket.employeeName}
                </p>
                <p className="text-xs font-mono text-slate-500">{ticket.employeeId}</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block text-[11px]">Designation</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{ticket.designation}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Department</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{ticket.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 truncate block">
                  {ticket.employeeEmail}
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Taxonomy Card */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Classification
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Category</span>
                <span className="font-bold text-slate-900 dark:text-white">{ticket.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Subcategory</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{ticket.subcategory}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Assigned Department</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{ticket.assignedDepartment}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Tags</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ticket.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER PANEL: Conversation Timeline, Internal Notes & Reply Box (col-span-6) */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Conversation Timeline &amp; Work Notes
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {visibleMessages.length} Messages
              </span>
            </div>

            {/* Message Thread */}
            <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
              {visibleMessages.map((msg) => {
                if (msg.isInternalNote) {
                  return (
                    <div
                      key={msg.id}
                      className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/40 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                          <Lock className="w-3.5 h-3.5" />
                          <span>CONFIDENTIAL INTERNAL NOTE</span>
                        </div>
                        <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed font-sans">
                        {msg.message}
                      </p>
                      <div className="text-[10px] text-amber-700/80 dark:text-amber-400/70 font-semibold">
                        Logged by {msg.senderName} · Hidden from employee
                      </div>
                    </div>
                  );
                }

                const isEmployee = msg.senderRole === 'employee';
                return (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-xl space-y-1.5 text-xs ${
                      isEmployee
                        ? 'bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mr-4'
                        : 'bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 ml-4'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {msg.senderName} {isEmployee ? '(Employee)' : '(HR Support)'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{msg.timestamp}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{msg.message}</p>

                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-wrap gap-2">
                        {msg.attachments.map((att) => (
                          <div
                            key={att.name}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 text-[11px] text-indigo-600"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>{att.name}</span>
                            <span className="text-slate-400">({att.size})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Reply Composer Form */}
            <form onSubmit={handleSend} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              {/* Reply vs Internal Note Selector Tabs */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveReplyMode('reply')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeReplyMode === 'reply'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Reply to Employee
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReplyMode('internal_note')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeReplyMode === 'internal_note'
                      ? 'bg-amber-500 text-slate-900 font-black shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  Add Internal Note
                </button>
              </div>

              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={
                  activeReplyMode === 'internal_note'
                    ? 'Write confidential internal observation (never exposed to employee)...'
                    : 'Compose official response to employee...'
                }
                rows={3}
                className={`w-full p-3 rounded-xl border text-xs text-slate-900 dark:text-white focus:outline-none transition-colors ${
                  activeReplyMode === 'internal_note'
                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-indigo-500'
                }`}
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {activeReplyMode === 'internal_note'
                    ? '🔒 Encrypted as HR Admin private record'
                    : '✉️ Employee will receive email notification'}
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting || !replyText.trim()}
                  className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{activeReplyMode === 'internal_note' ? 'Save Note' : 'Send Reply'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT PANEL: Status, SLA Countdown, Priority & Agent Assignment (col-span-3) */}
        <div className="lg:col-span-3 space-y-4">
          {/* SLA Countdown Card */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              SLA Countdown
            </h3>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-center space-y-1">
              <span className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {ticket.slaCountdownHours > 0 ? `${ticket.slaCountdownHours}h 00m` : 'EXPIRED'}
              </span>
              <p
                className={`text-xs font-bold ${
                  ticket.slaStatus === 'Breached'
                    ? 'text-rose-600'
                    : ticket.slaStatus === 'Approaching Breach'
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {ticket.slaStatus}
              </p>
            </div>

            <div className="space-y-1 text-xs text-slate-500 pt-1">
              <div className="flex justify-between">
                <span>Created Date:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{ticket.createdDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Resolution Due:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{ticket.dueDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{ticket.lastUpdated}</span>
              </div>
              <div className="flex justify-between">
                <span>Escalation Level:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Level {ticket.escalationLevel}</span>
              </div>
            </div>
          </div>

          {/* Quick Property Controllers */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ticket Settings
            </h3>

            {/* Status Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500">Ticket Status</label>
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-semibold cursor-pointer"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending (Waiting on Employee)</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
                <option value="Escalated">Escalated</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500">Priority Level</label>
              <select
                value={ticket.priority}
                onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-semibold cursor-pointer"
              >
                <option value="Critical">Critical (4h SLA)</option>
                <option value="High">High (24h SLA)</option>
                <option value="Medium">Medium (48h SLA)</option>
                <option value="Low">Low (96h SLA)</option>
              </select>
            </div>

            {/* Assigned Agent Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500">Assigned Agent</label>
              <select
                value={ticket.assignedAgentId || ''}
                onChange={(e) => handleAssignAgent(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-semibold cursor-pointer"
              >
                <option value="">Unassigned</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.department})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
