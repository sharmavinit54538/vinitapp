'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  SupportTicket,
  SupportAgent,
  filterTickets,
  TicketPriority,
  TicketStatus,
  MainCategory,
} from '@/lib/helpdesk-types';
import { Ofc360Role } from '@/lib/auth-schemas';
import {
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit2,
  Eye,
  CheckSquare,
  Square,
  ChevronDown,
  ArrowUpDown,
  MoreVertical,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';

interface AllTicketsViewProps {
  tickets: SupportTicket[];
  agents: SupportAgent[];
  activeRole: Ofc360Role;
  initialStatusFilter?: string;
  onSelectTicket: (ticketId: string) => void;
  onCreateTicket?: () => void;
  onUpdateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  onBulkUpdate: (ticketIds: string[], action: 'assign' | 'status', value: string) => void;
  onDeleteTicket?: (ticketId: string) => void;
  onSuccessToast: (msg: string) => void;
}

export function AllTicketsView({
  tickets,
  agents,
  activeRole,
  initialStatusFilter = 'All',
  onSelectTicket,
  onCreateTicket,
  onUpdateTicketStatus,
  onBulkUpdate,
  onDeleteTicket,
  onSuccessToast,
}: AllTicketsViewProps) {
  const router = useRouter();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [agentFilter, setAgentFilter] = useState('All');

  // Sorting & Pagination
  const [sortBy, setSortBy] = useState<'created' | 'priority' | 'sla'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Bulk Selection
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [bulkAgentModalOpen, setBulkAgentModalOpen] = useState(false);
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);

  // Column Visibility
  const [showColumns, setShowColumns] = useState({
    ticketId: true,
    subject: true,
    employee: true,
    category: true,
    priority: true,
    status: true,
    sla: true,
    agent: true,
    created: true,
    actions: true,
  });

  const canEdit = activeRole === 'super_admin' || activeRole === 'hr_admin';

  // Filtered & Sorted
  const filteredTickets = useMemo(() => {
    let list = filterTickets(tickets, {
      query: searchQuery,
      status: statusFilter,
      priority: priorityFilter,
      category: categoryFilter,
      department: departmentFilter,
      assignedAgentId: agentFilter,
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        const diff = priorityWeight[b.priority] - priorityWeight[a.priority];
        return sortOrder === 'desc' ? diff : -diff;
      }
      if (sortBy === 'sla') {
        const diff = a.slaCountdownHours - b.slaCountdownHours;
        return sortOrder === 'asc' ? diff : -diff;
      }
      // default created
      return sortOrder === 'desc' ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id);
    });

    return list;
  }, [
    tickets,
    searchQuery,
    statusFilter,
    priorityFilter,
    categoryFilter,
    departmentFilter,
    agentFilter,
    sortBy,
    sortOrder,
  ]);

  const totalPages = Math.ceil(filteredTickets.length / pageSize) || 1;
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelectAll = () => {
    if (selectedTicketIds.length === paginatedTickets.length) {
      setSelectedTicketIds([]);
    } else {
      setSelectedTicketIds(paginatedTickets.map((t) => t.id));
    }
  };

  const toggleSelectTicket = (id: string) => {
    setSelectedTicketIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExportCsv = () => {
    const csvContent = [
      'Ticket Number,Subject,Employee ID,Employee Name,Department,Category,Subcategory,Priority,Status,SLA Status,Assigned Agent,Created Date',
      ...filteredTickets.map(
        (t) =>
          `"${t.ticketNumber}","${t.subject.replace(/"/g, '""')}","${t.employeeId}","${t.employeeName}","${t.department}","${t.category}","${t.subcategory}","${t.priority}","${t.status}","${t.slaStatus}","${t.assignedAgentName || 'Unassigned'}","${t.createdDate}"`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OFC360_Tickets_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onSuccessToast(`Exported ${filteredTickets.length} tickets to CSV.`);
  };

  const handleBulkAssign = (agentId: string) => {
    onBulkUpdate(selectedTicketIds, 'assign', agentId);
    setSelectedTicketIds([]);
    setBulkAgentModalOpen(false);
    onSuccessToast(`Reassigned ${selectedTicketIds.length} tickets.`);
  };

  const handleBulkStatus = (status: string) => {
    onBulkUpdate(selectedTicketIds, 'status', status);
    setSelectedTicketIds([]);
    setBulkStatusModalOpen(false);
    onSuccessToast(`Updated status for ${selectedTicketIds.length} tickets.`);
  };

  const handleDelete = (id: string, number: string) => {
    if (!canEdit) {
      onSuccessToast('Permission denied: Only HR Admin can delete tickets.');
      return;
    }
    if (onDeleteTicket) {
      onDeleteTicket(id);
      onSuccessToast(`Ticket ${number} archived.`);
    }
  };

  return (
    <div className="space-y-4" data-testid="all-tickets-management-view">
      {/* 1. TOP HEADER & SEARCH / FILTER TOOLBAR */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Enterprise Support Ticket Queue
            </h2>
            <p className="text-xs text-slate-500">
              {filteredTickets.length} tickets matching current filters
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {onCreateTicket && (
              <button
                type="button"
                onClick={onCreateTicket}
                className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Ticket</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 pt-1">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket #, employee, subject..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
            <option value="Escalated">Escalated</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="HR Support">HR Support</option>
            <option value="Payroll Support">Payroll Support</option>
            <option value="Attendance Support">Attendance Support</option>
            <option value="Leave Support">Leave Support</option>
            <option value="IT Support">IT Support</option>
            <option value="Other">Other</option>
          </select>

          {/* Assigned Agent Filter */}
          <select
            value={agentFilter}
            onChange={(e) => {
              setAgentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="All">All Agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bulk Action Controls if items selected */}
        {selectedTicketIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs">
            <span className="font-bold text-indigo-900 dark:text-indigo-200">
              {selectedTicketIds.length} tickets selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBulkAgentModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-semibold cursor-pointer"
              >
                Bulk Assign Agent
              </button>
              <button
                type="button"
                onClick={() => setBulkStatusModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold cursor-pointer"
              >
                Bulk Update Status
              </button>
              <button
                type="button"
                onClick={() => setSelectedTicketIds([])}
                className="text-slate-500 hover:text-slate-900 underline ml-1 cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. TICKETS DATA TABLE */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3.5 w-10">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    aria-label="Select all tickets"
                    className="cursor-pointer"
                  >
                    {selectedTicketIds.length > 0 &&
                    selectedTicketIds.length === paginatedTickets.length ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">Ticket #</th>
                <th className="py-3 px-3">Subject</th>
                <th className="py-3 px-3">Employee</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">SLA Status</th>
                <th className="py-3 px-3">Assigned Agent</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedTickets.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-500">
                    <p className="text-sm font-semibold">No tickets found</p>
                    <p className="text-xs">Adjust your search or active filter criteria.</p>
                  </td>
                </tr>
              ) : (
                paginatedTickets.map((ticket) => {
                  const isSelected = selectedTicketIds.includes(ticket.id);
                  return (
                    <tr
                      key={ticket.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3.5">
                        <button
                          type="button"
                          onClick={() => toggleSelectTicket(ticket.id)}
                          aria-label={`Select ticket ${ticket.ticketNumber}`}
                          className="cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSelectTicket(ticket.id)}
                          className="hover:underline cursor-pointer"
                        >
                          {ticket.ticketNumber}
                        </button>
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <button
                          type="button"
                          onClick={() => onSelectTicket(ticket.id)}
                          className="text-left font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-indigo-600 cursor-pointer"
                        >
                          {ticket.subject}
                        </button>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{ticket.description}</p>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <p className="font-semibold text-slate-900 dark:text-white">{ticket.employeeName}</p>
                        <p className="text-[11px] text-slate-500">{ticket.department} · {ticket.employeeId}</p>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                          {ticket.category}
                        </span>
                        <span className="text-[11px] text-slate-500">{ticket.subcategory}</span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ticket.priority === 'Critical'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : ticket.priority === 'High'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : ticket.priority === 'Medium'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            ticket.status === 'Resolved' || ticket.status === 'Closed'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : ticket.status === 'Escalated'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : ticket.status === 'In Progress'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px]">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            ticket.slaStatus === 'Breached'
                              ? 'text-rose-600 dark:text-rose-400'
                              : ticket.slaStatus === 'Approaching Breach'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {ticket.slaStatus}
                        </span>
                        <p className="text-[10px] text-slate-400">
                          {ticket.slaCountdownHours > 0 ? `${ticket.slaCountdownHours}h left` : 'Expired'}
                        </p>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {ticket.assignedAgentName || 'Unassigned'}
                        </p>
                        <p className="text-[11px] text-slate-500">{ticket.assignedDepartment}</p>
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onSelectTicket(ticket.id)}
                            title="Open Ticket Workspace"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleDelete(ticket.id, ticket.ticketNumber)}
                              title="Archive Ticket"
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 text-slate-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 3. PAGINATION CONTROLS */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page {currentPage} of {totalPages} ({filteredTickets.length} items)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Agent Assign Modal */}
      {bulkAgentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Bulk Reassign {selectedTicketIds.length} Tickets
            </h3>
            <div className="space-y-2">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => handleBulkAssign(agent.id)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 flex items-center justify-between text-left cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{agent.name}</p>
                    <p className="text-[11px] text-slate-500">{agent.department} · {agent.assignedTicketsCount} active</p>
                  </div>
                  <span className="text-[11px] text-indigo-600 font-semibold">Assign</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setBulkAgentModalOpen(false)}
              className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bulk Status Update Modal */}
      {bulkStatusModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Bulk Status Update ({selectedTicketIds.length} Tickets)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {(['Open', 'In Progress', 'Pending', 'Resolved', 'Closed'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleBulkStatus(st)}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-xs font-bold text-center cursor-pointer"
                >
                  Mark {st}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setBulkStatusModalOpen(false)}
              className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
