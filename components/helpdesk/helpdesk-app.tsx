'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Provider } from 'react-redux';
import { makeHrStore, AppStore } from '@/lib/store';
import {
  HelpDeskState,
  HelpDeskNavId,
  createInitialHelpDeskState,
  TicketStatus,
  TicketPriority,
  SupportTicket,
  ConfidentialComplaintItem,
  KbArticle,
  SlaRuleConfig,
} from '@/lib/helpdesk-types';
import { Ofc360Role } from '@/lib/auth-schemas';
import {
  useGetHelpDeskDataQuery,
  useCreateTicketMutation,
  useSendTicketMessageMutation,
  useUpdateTicketMutation,
  useBulkUpdateTicketsMutation,
  useActionEmployeeRequestMutation,
  useSubmitComplaintMutation,
  useAddInvestigationNoteMutation,
  useSaveKbArticleMutation,
  useSubmitArticleFeedbackMutation,
  useUpdateSlaRuleMutation,
} from '@/lib/store/helpdesk-api';
import { HelpDeskShell } from './helpdesk-shell';
import { HelpDeskOverview } from './helpdesk-overview';
import { AllTicketsView } from './all-tickets-view';
import { TicketDetailView } from './ticket-detail-view';
import { EmployeeRequestsView } from './employee-requests-view';
import { ComplaintManagementView } from './complaint-management-view';
import { SlaManagementView } from './sla-management-view';
import { AgentManagementView } from './agent-management-view';
import { CategoriesDepartmentsView } from './categories-departments-view';
import { KnowledgeBaseView } from './knowledge-base-view';
import { FaqManagementView } from './faq-management-view';
import { HelpDeskAnnouncementsView } from './helpdesk-announcements-view';
import { HelpDeskReportsView } from './helpdesk-reports-view';
import { HelpDeskSettingsView } from './helpdesk-settings-view';
import { AiAssistanceModal } from './ai-assistance-modal';
import { CheckCircle2, X } from 'lucide-react';

interface HelpDeskAppProps {
  initialNavId?: HelpDeskNavId;
  initialTicketId?: string;
}

function HelpDeskAppInner({
  initialNavId = 'overview',
  initialTicketId,
}: HelpDeskAppProps) {
  const router = useRouter();
  const [activeNavId, setActiveNavId] = useState<HelpDeskNavId>(initialNavId);
  const [activeRole, setActiveRole] = useState<Ofc360Role>('hr_admin');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(initialTicketId || null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Ticket Form State
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<SupportTicket['category']>('HR Support');
  const [newPriority, setNewPriority] = useState<TicketPriority>('Medium');
  const [newEmpName, setNewEmpName] = useState('Elena Rostova');
  const [newEmpId, setNewEmpId] = useState('EMP-3601');
  const [newDepartment, setNewDepartment] = useState('Engineering');

  const { data: remoteState } = useGetHelpDeskDataQuery();
  const [fallbackState] = useState(() => createInitialHelpDeskState());
  const helpDeskState = remoteState || fallbackState;

  // Mutations
  const [createTicketMutation] = useCreateTicketMutation();
  const [sendMessageMutation] = useSendTicketMessageMutation();
  const [updateTicketMutation] = useUpdateTicketMutation();
  const [bulkUpdateMutation] = useBulkUpdateTicketsMutation();
  const [actionRequestMutation] = useActionEmployeeRequestMutation();
  const [submitComplaintMutation] = useSubmitComplaintMutation();
  const [addInvestigationNoteMutation] = useAddInvestigationNoteMutation();
  const [saveKbArticleMutation] = useSaveKbArticleMutation();
  const [submitArticleFeedbackMutation] = useSubmitArticleFeedbackMutation();
  const [updateSlaRuleMutation] = useUpdateSlaRuleMutation();

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const selectedTicket = selectedTicketId
    ? helpDeskState.tickets.find((t) => t.id === selectedTicketId || t.ticketNumber === selectedTicketId)
    : null;

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    try {
      await createTicketMutation({
        subject: newSubject.trim(),
        description: newDescription.trim() || newSubject.trim(),
        category: newCategory,
        priority: newPriority,
        employeeName: newEmpName,
        employeeId: newEmpId,
        department: newDepartment,
      }).unwrap();

      triggerToast('Support ticket logged successfully.');
      setNewTicketModalOpen(false);
      setNewSubject('');
      setNewDescription('');
    } catch {
      triggerToast('Failed to create ticket.');
    }
  };

  return (
    <HelpDeskShell
      activeNavId={activeNavId}
      activeRole={activeRole}
      onRoleChange={setActiveRole}
      isDarkMode={isDarkMode}
      onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      onOpenNewTicket={() => setNewTicketModalOpen(true)}
      onOpenAiAssist={() => setAiModalOpen(true)}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100 px-4 py-3 text-xs font-semibold shadow-lg flex items-center justify-between gap-3 max-w-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button type="button" onClick={() => setToastMessage(null)} className="cursor-pointer">
            <X className="w-3.5 h-3.5 text-emerald-600" />
          </button>
        </div>
      )}

      {/* If a ticket is currently open in detail view */}
      {selectedTicket ? (
        <TicketDetailView
          ticket={selectedTicket}
          agents={helpDeskState.agents}
          activeRole={activeRole}
          onBack={() => setSelectedTicketId(null)}
          onSendMessage={async ({ ticketId, message, isInternalNote }) => {
            await sendMessageMutation({
              ticketId,
              message,
              isInternalNote,
              senderName: activeRole === 'employee' ? selectedTicket.employeeName : 'Aarav Sharma',
              senderRole: activeRole,
            }).unwrap();
          }}
          onUpdateTicket={async (params) => {
            await updateTicketMutation(params).unwrap();
          }}
          onSuccessToast={triggerToast}
        />
      ) : (
        <>
          {/* 1. OVERVIEW DASHBOARD */}
          {activeNavId === 'overview' && (
            <HelpDeskOverview
              state={helpDeskState}
              onFilterNavigate={(status) => {
                setActiveNavId('all_tickets');
              }}
              onSuccessToast={triggerToast}
            />
          )}

          {/* 2. ALL TICKETS */}
          {activeNavId === 'all_tickets' && (
            <AllTicketsView
              tickets={helpDeskState.tickets}
              agents={helpDeskState.agents}
              activeRole={activeRole}
              onSelectTicket={(id) => setSelectedTicketId(id)}
              onCreateTicket={() => setNewTicketModalOpen(true)}
              onUpdateTicketStatus={async (ticketId, status) => {
                await updateTicketMutation({ ticketId, status }).unwrap();
              }}
              onBulkUpdate={async (ticketIds, action, value) => {
                await bulkUpdateMutation({
                  ticketIds,
                  action,
                  agentId: action === 'assign' ? value : undefined,
                  status: action === 'status' ? value : undefined,
                }).unwrap();
              }}
              onDeleteTicket={(id) => {
                triggerToast('Ticket moved to archive queue.');
              }}
              onSuccessToast={triggerToast}
            />
          )}

          {/* 3. MY ASSIGNED TICKETS */}
          {activeNavId === 'my_assigned' && (
            <AllTicketsView
              tickets={helpDeskState.tickets.filter((t) => t.assignedAgentId === 'AGT-01')}
              agents={helpDeskState.agents}
              activeRole={activeRole}
              onSelectTicket={(id) => setSelectedTicketId(id)}
              onCreateTicket={() => setNewTicketModalOpen(true)}
              onUpdateTicketStatus={async (ticketId, status) => {
                await updateTicketMutation({ ticketId, status }).unwrap();
              }}
              onBulkUpdate={async (ticketIds, action, value) => {
                await bulkUpdateMutation({
                  ticketIds,
                  action,
                  agentId: action === 'assign' ? value : undefined,
                  status: action === 'status' ? value : undefined,
                }).unwrap();
              }}
              onSuccessToast={triggerToast}
            />
          )}

          {/* 4. EMPLOYEE REQUESTS */}
          {activeNavId === 'employee_requests' && (
            <EmployeeRequestsView
              requests={helpDeskState.employeeRequests}
              activeRole={activeRole}
              onActionRequest={async (requestId, action, notes) => {
                await actionRequestMutation({ requestId, action, notes }).unwrap();
              }}
              onSuccessToast={triggerToast}
            />
          )}

          {/* 5. COMPLAINTS */}
          {activeNavId === 'complaints' && (
            <ComplaintManagementView
              complaints={helpDeskState.complaints}
              activeRole={activeRole}
              onSubmitComplaint={async (complaint) => {
                await submitComplaintMutation(complaint).unwrap();
              }}
              onAddNote={async (complaintId, note) => {
                await addInvestigationNoteMutation({ complaintId, note }).unwrap();
              }}
              onSuccessToast={triggerToast}
            />
          )}

          {/* 6. ESCALATIONS */}
          {activeNavId === 'escalations' && (
            <AllTicketsView
              tickets={helpDeskState.tickets.filter(
                (t) => t.status === 'Escalated' || t.slaStatus === 'Breached' || t.escalationLevel > 0
              )}
              agents={helpDeskState.agents}
              activeRole={activeRole}
              onSelectTicket={(id) => setSelectedTicketId(id)}
              onUpdateTicketStatus={async (ticketId, status) => {
                await updateTicketMutation({ ticketId, status }).unwrap();
              }}
              onBulkUpdate={async (ticketIds, action, value) => {
                await bulkUpdateMutation({
                  ticketIds,
                  action,
                  agentId: action === 'assign' ? value : undefined,
                  status: action === 'status' ? value : undefined,
                }).unwrap();
              }}
              onSuccessToast={triggerToast}
            />
          )}

          {/* 7. SLA MANAGEMENT */}
          {activeNavId === 'sla_management' && (
            <SlaManagementView
              slaRules={helpDeskState.slaRules}
              canEdit={activeRole === 'super_admin' || activeRole === 'hr_admin'}
              onUpdateRule={async (rule) => {
                await updateSlaRuleMutation(rule).unwrap();
              }}
              onSuccessToast={triggerToast}
            />
          )}

          {/* 8. AGENT MANAGEMENT */}
          {activeNavId === 'agent_management' && (
            <AgentManagementView
              agents={helpDeskState.agents}
              canEdit={activeRole === 'super_admin' || activeRole === 'hr_admin'}
              onSuccessToast={triggerToast}
            />
          )}

          {/* 9. CATEGORIES & DEPARTMENTS */}
          {activeNavId === 'categories' && <CategoriesDepartmentsView />}

          {/* 10. KNOWLEDGE BASE */}
          {activeNavId === 'knowledge_base' && (
            <KnowledgeBaseView
              articles={helpDeskState.kbArticles}
              canEdit={activeRole === 'super_admin' || activeRole === 'hr_admin'}
              onSaveArticle={async (art) => {
                await saveKbArticleMutation(art).unwrap();
              }}
              onSubmitFeedback={async (articleId, type) => {
                await submitArticleFeedbackMutation({ articleId, type }).unwrap();
              }}
              onSuccessToast={triggerToast}
            />
          )}

          {/* 11. FAQ MANAGEMENT */}
          {activeNavId === 'faq_management' && (
            <FaqManagementView
              faqs={helpDeskState.faqs}
              canEdit={activeRole === 'super_admin' || activeRole === 'hr_admin'}
              onSuccessToast={triggerToast}
            />
          )}

          {/* 12. ANNOUNCEMENTS */}
          {activeNavId === 'announcements' && (
            <HelpDeskAnnouncementsView
              announcements={helpDeskState.announcements}
              canEdit={activeRole === 'super_admin' || activeRole === 'hr_admin'}
              onSuccessToast={triggerToast}
            />
          )}

          {/* 13. REPORTS & ANALYTICS */}
          {activeNavId === 'reports_analytics' && (
            <HelpDeskReportsView state={helpDeskState} onSuccessToast={triggerToast} />
          )}

          {/* 14. HELP DESK SETTINGS */}
          {activeNavId === 'settings' && (
            <HelpDeskSettingsView
              settings={helpDeskState.settings}
              canEdit={activeRole === 'super_admin' || activeRole === 'hr_admin'}
              onSuccessToast={triggerToast}
            />
          )}
        </>
      )}

      {/* AI Assistance Modal */}
      <AiAssistanceModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onSuccessToast={triggerToast}
      />

      {/* Create Ticket Modal */}
      {newTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Log New Support Ticket
              </h3>
              <button
                type="button"
                onClick={() => setNewTicketModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Ticket Subject
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. November Payslip Tax Deduction Discrepancy..."
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as SupportTicket['category'])}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="HR Support">HR Support</option>
                    <option value="Payroll Support">Payroll Support</option>
                    <option value="Attendance Support">Attendance Support</option>
                    <option value="Leave Support">Leave Support</option>
                    <option value="IT Support">IT Support</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Critical">Critical (4h SLA)</option>
                    <option value="High">High (24h SLA)</option>
                    <option value="Medium">Medium (48h SLA)</option>
                    <option value="Low">Low (96h SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Detailed Issue Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Provide complete factual details, dates, transaction references..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Employee Name
                  </label>
                  <input
                    type="text"
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewTicketModalOpen(false)}
                  className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HelpDeskShell>
  );
}

export function HelpDeskApp(props: HelpDeskAppProps) {
  const [store] = useState(() => makeHrStore());
  return (
    <Provider store={store}>
      <HelpDeskAppInner {...props} />
    </Provider>
  );
}
