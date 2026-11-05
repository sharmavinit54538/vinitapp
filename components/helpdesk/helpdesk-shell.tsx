'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HELPDESK_NAV_ITEMS,
  HelpDeskNavId,
  SupportTicket,
} from '@/lib/helpdesk-types';
import { Ofc360Role, OFC360_ROLES } from '@/lib/auth-schemas';
import { Ofc360LogoMark } from '@/components/auth/shared';
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
  Search,
  Sparkles,
  Plus,
  ArrowLeft,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

interface HelpDeskShellProps {
  children: React.ReactNode;
  activeNavId: HelpDeskNavId;
  activeRole: Ofc360Role;
  onRoleChange: (role: Ofc360Role) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenNewTicket?: () => void;
  onOpenAiAssist?: () => void;
}

const NAV_ICON_MAP: Record<string, React.ElementType> = {
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
};

export function HelpDeskShell({
  children,
  activeNavId,
  activeRole,
  onRoleChange,
  isDarkMode,
  onToggleDarkMode,
  onOpenNewTicket,
  onOpenAiAssist,
}: HelpDeskShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const currentItem = HELPDESK_NAV_ITEMS.find((item) => item.id === activeNavId) || HELPDESK_NAV_ITEMS[0];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors`}>
      {/* 1. TOP ENTERPRISE APP HEADER */}
      <header className="sticky top-0 z-40 h-15 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-3 shadow-xs">
        {/* Left Branding & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Help Desk Navigation"
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5">
            <Ofc360LogoMark size="sm" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-slate-300 dark:text-slate-700 font-light">|</span>
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Help Desk
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search & Breadcrumbs */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            HRMS Mobile Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-900 dark:text-white">{currentItem.title}</span>
        </div>

        {/* Right Actions: AI Assist, Theme, New Ticket */}
        <div className="flex items-center gap-2">
          {onOpenAiAssist && (
            <button
              type="button"
              onClick={onOpenAiAssist}
              data-testid="helpdesk-ai-assist-btn"
              className="min-h-[38px] px-3 rounded-xl bg-violet-50 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900 border border-violet-200 dark:border-violet-800 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="hidden sm:inline">AI Help Desk</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label="Toggle Theme"
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* New Ticket CTA */}
          {onOpenNewTicket && (
            <button
              type="button"
              onClick={onOpenNewTicket}
              data-testid="helpdesk-new-ticket-btn"
              className="min-h-[38px] px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Ticket</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. BODY LAYOUT: FIXED ENTERPRISE SIDEBAR + CONTENT WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (w-64 = 256px) */}
        <aside
          className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 select-none overflow-y-auto"
          aria-label="Help Desk Navigation"
        >
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Support Workspace
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                v360.4
              </span>
            </div>
          </div>

          <nav className="p-3 space-y-0.5 flex-1">
            {HELPDESK_NAV_ITEMS.map((item) => {
              const IconComp = NAV_ICON_MAP[item.icon] || Ticket;
              const isActive = activeNavId === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.route}
                  data-testid={`helpdesk-nav-${item.id}`}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs border border-indigo-100 dark:border-indigo-900/50'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <Link
              href="/"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span className="flex items-center gap-2">
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to HRMS Mobile
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-xs flex">
            <div className="w-72 bg-white dark:bg-slate-900 h-full p-4 overflow-y-auto space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Ofc360LogoMark size="sm" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Help Desk</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <nav className="space-y-1">
                {HELPDESK_NAV_ITEMS.map((item) => {
                  const IconComp = NAV_ICON_MAP[item.icon] || Ticket;
                  const isActive = activeNavId === item.id;
                  return (
                    <Link
                      key={item.id}
                      href={item.route}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <IconComp className="w-4 h-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Exit to HRMS Mobile App
                </Link>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* 3. MAIN WORKSPACE CONTAINER */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
