'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HELPDESK_NAV_ITEMS,
  HelpDeskNavId,
} from '@/lib/helpdesk-types';
import { Ofc360Role } from '@/lib/auth-schemas';
import {
  LayoutDashboard,
  Ticket,
  UserCheck,
  FileText,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Users,
  FolderTree,
  BookOpen,
  HelpCircle,
  Megaphone,
  BarChart3,
  Settings,
  Sparkles,
  Plus,
  ArrowLeft,
  Grid,
  Search,
  X,
} from 'lucide-react';

export interface HelpDeskShellProps {
  children: React.ReactNode;
  activeNavId: HelpDeskNavId;
  onSelectNavId?: (id: HelpDeskNavId) => void;
  activeRole: Ofc360Role;
  onRoleChange: (role: Ofc360Role) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenNewTicket?: () => void;
  onOpenAiAssist?: () => void;
  embedded?: boolean;
  startInDirectory?: boolean;
}

interface MobileModuleMeta {
  id: HelpDeskNavId;
  title: string;
  subtitle: string;
  group: 'Tickets & Queue' | 'Requests & Escalations' | 'Operations & SLA' | 'Knowledge & Analytics';
  Icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

export const HELPDESK_MOBILE_MODULES: MobileModuleMeta[] = [
  {
    id: 'overview',
    title: 'Overview',
    subtitle: 'Live ticket KPIs, SLA health & support metrics',
    group: 'Tickets & Queue',
    Icon: LayoutDashboard,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    id: 'all_tickets',
    title: 'All Tickets',
    subtitle: 'Complete support queue, filters & status actions',
    group: 'Tickets & Queue',
    Icon: Ticket,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    id: 'my_assigned',
    title: 'My Assigned Tickets',
    subtitle: 'Tickets assigned directly to your support desk',
    group: 'Tickets & Queue',
    Icon: UserCheck,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'employee_requests',
    title: 'Employee Requests',
    subtitle: 'Payslip, experience letter & verification requests',
    group: 'Requests & Escalations',
    Icon: FileText,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    id: 'complaints',
    title: 'Complaints',
    subtitle: 'Confidential POSH, ethics & grievance cases',
    group: 'Requests & Escalations',
    Icon: ShieldAlert,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
  {
    id: 'escalations',
    title: 'Escalations',
    subtitle: 'SLA breached & tier-2/tier-3 priority escalations',
    group: 'Requests & Escalations',
    Icon: AlertTriangle,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    id: 'sla_management',
    title: 'SLA Management',
    subtitle: 'Response & resolution target timers by priority',
    group: 'Operations & SLA',
    Icon: Clock,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  {
    id: 'agent_management',
    title: 'Agent Management',
    subtitle: 'Support agents, active workload & CSAT ratings',
    group: 'Operations & SLA',
    Icon: Users,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    id: 'categories',
    title: 'Categories & Departments',
    subtitle: 'Ticket routing categories & department queues',
    group: 'Operations & SLA',
    Icon: FolderTree,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'knowledge_base',
    title: 'Knowledge Base',
    subtitle: 'Self-service HR, IT & payroll policy articles',
    group: 'Knowledge & Analytics',
    Icon: BookOpen,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    id: 'faq_management',
    title: 'FAQ Management',
    subtitle: 'Instant answers to common employee questions',
    group: 'Knowledge & Analytics',
    Icon: HelpCircle,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    id: 'announcements',
    title: 'Announcements',
    subtitle: 'Support broadcasts, maintenance & policy notices',
    group: 'Knowledge & Analytics',
    Icon: Megaphone,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    id: 'reports_analytics',
    title: 'Reports & Analytics',
    subtitle: 'Resolution trends, SLA compliance & CSAT insights',
    group: 'Knowledge & Analytics',
    Icon: BarChart3,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'settings',
    title: 'Help Desk Settings',
    subtitle: 'Auto-routing, ticket numbering & alert rules',
    group: 'Knowledge & Analytics',
    Icon: Settings,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
  },
];

const MOBILE_GROUPS: Array<{
  title: MobileModuleMeta['group'];
  items: MobileModuleMeta[];
}> = [
  {
    title: 'Tickets & Queue',
    items: HELPDESK_MOBILE_MODULES.filter((m) => m.group === 'Tickets & Queue'),
  },
  {
    title: 'Requests & Escalations',
    items: HELPDESK_MOBILE_MODULES.filter(
      (m) => m.group === 'Requests & Escalations'
    ),
  },
  {
    title: 'Operations & SLA',
    items: HELPDESK_MOBILE_MODULES.filter((m) => m.group === 'Operations & SLA'),
  },
  {
    title: 'Knowledge & Analytics',
    items: HELPDESK_MOBILE_MODULES.filter(
      (m) => m.group === 'Knowledge & Analytics'
    ),
  },
];

export function HelpDeskShell({
  children,
  activeNavId,
  onSelectNavId,
  onOpenNewTicket,
  onOpenAiAssist,
  embedded = false,
  startInDirectory = false,
}: HelpDeskShellProps) {
  const [showDirectory, setShowDirectory] = useState<boolean>(startInDirectory);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentModule =
    HELPDESK_MOBILE_MODULES.find((item) => item.id === activeNavId) ||
    HELPDESK_MOBILE_MODULES[0];

  const filteredGroups = MOBILE_GROUPS.map((group) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return group;
    return {
      ...group,
      items: group.items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
      ),
    };
  }).filter((group) => group.items.length > 0);

  const handleModuleTap = (id: HelpDeskNavId) => {
    if (onSelectNavId) {
      onSelectNavId(id);
    }
    setShowDirectory(false);
  };

  return (
    <div
      className={
        embedded
          ? 'space-y-3.5 pb-6 font-sans text-slate-900'
          : 'min-h-screen bg-slate-100 flex justify-center font-sans text-slate-900'
      }
    >
      <div
        className={
          embedded
            ? 'w-full space-y-3.5'
            : 'w-full max-w-[440px] min-h-screen bg-slate-50 border-x border-slate-200 flex flex-col shadow-sm'
        }
      >
        {/* 1. TOP ACTION / NAVIGATION BAR */}
        <div
          className={
            embedded
              ? 'flex items-center gap-2 rounded-2xl bg-white border border-slate-200 p-2.5 shadow-xs'
              : 'sticky top-0 z-30 flex items-center gap-2 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3.5 py-2.5 shadow-xs'
          }
        >
          {!showDirectory ? (
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setShowDirectory(true)}
                aria-label="Back to Help & Support Modules"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-indigo-50 px-3 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Modules</span>
              </button>
              <div className="min-w-0 truncate text-xs font-bold text-slate-800">
                {currentModule.title}
              </div>
            </div>
          ) : (
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 14 support modules..."
                className="h-9 w-full rounded-xl bg-slate-100 pl-8.5 pr-8 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-indigo-500 border border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenAiAssist && (
              <button
                type="button"
                onClick={onOpenAiAssist}
                data-testid="helpdesk-ai-assist-btn"
                title="AI Help Desk Assistant"
                className="flex h-9 items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-2.5 text-xs font-bold text-violet-700 hover:bg-violet-100 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <Sparkles className="h-4 w-4 text-violet-600 shrink-0" />
                <span className="hidden sm:inline">AI Help</span>
              </button>
            )}

            {onOpenNewTicket && (
              <button
                type="button"
                onClick={onOpenNewTicket}
                data-testid="helpdesk-new-ticket-btn"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-indigo-600 px-3 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Ticket</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. MOBILE APP BODY: GROUPED CARD DIRECTORY OR ACTIVE MODULE */}
        <main
          className={
            showDirectory
              ? 'w-full p-0 m-0'
              : embedded
                ? 'space-y-3.5 p-4'
                : 'flex-1 overflow-y-auto px-3.5 py-4 space-y-4 pb-20'
          }
        >
          {showDirectory ? (
            <div data-testid="helpdesk-mobile-directory" className="w-full p-0 m-0">
              {filteredGroups.length === 0 ? (
                <div className="bg-white p-8 text-center">
                  <p className="text-sm font-semibold text-zinc-700">
                    No modules found matching &ldquo;{searchQuery}&rdquo;
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-zinc-950 hover:underline cursor-pointer"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="w-full bg-white divide-y divide-zinc-100">
                  {filteredGroups
                    .flatMap((group) => group.items)
                    .map((mod) => {
                      const isCurrent = activeNavId === mod.id;
                      return (
                        <button
                          key={mod.id}
                          type="button"
                          onClick={() => handleModuleTap(mod.id)}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-zinc-100/70 cursor-pointer"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-[14px] font-semibold text-zinc-950">
                                {mod.title}
                              </p>
                              {isCurrent && (
                                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[9px] font-bold text-zinc-900 uppercase">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="truncate text-[12px] font-normal text-zinc-500 mt-0.5">
                              {mod.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">{children}</div>
          )}
        </main>

        {/* 3. STICKY MOBILE BOTTOM NAVIGATION BAR (When standalone page) */}
        {!embedded && (
          <nav className="sticky bottom-0 z-30 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md">
            {(
              [
                {
                  id: 'directory',
                  label: 'All Menu',
                  Icon: Grid,
                  isActive: showDirectory,
                  onTap: () => setShowDirectory(true),
                },
                {
                  id: 'overview',
                  label: 'Overview',
                  Icon: LayoutDashboard,
                  isActive: !showDirectory && activeNavId === 'overview',
                  onTap: () => handleModuleTap('overview'),
                },
                {
                  id: 'all_tickets',
                  label: 'Tickets',
                  Icon: Ticket,
                  isActive:
                    !showDirectory &&
                    (activeNavId === 'all_tickets' ||
                      activeNavId === 'my_assigned'),
                  onTap: () => handleModuleTap('all_tickets'),
                },
                {
                  id: 'employee_requests',
                  label: 'Requests',
                  Icon: FileText,
                  isActive:
                    !showDirectory && activeNavId === 'employee_requests',
                  onTap: () => handleModuleTap('employee_requests'),
                },
                {
                  id: 'knowledge_base',
                  label: 'KB & FAQ',
                  Icon: BookOpen,
                  isActive:
                    !showDirectory &&
                    (activeNavId === 'knowledge_base' ||
                      activeNavId === 'faq_management'),
                  onTap: () => handleModuleTap('knowledge_base'),
                },
              ] as const
            ).map((tab) => {
              const TabIcon = tab.Icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={tab.onTap}
                  className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[10px] font-bold transition-colors cursor-pointer ${
                    tab.isActive ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                >
                  <TabIcon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
