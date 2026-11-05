'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HelpDeskState, SupportTicket } from '@/lib/helpdesk-types';
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
  Users,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  Download,
  Calendar,
  Sparkles,
  Star,
  ChevronRight,
  BarChart2,
} from 'lucide-react';

interface HelpDeskOverviewProps {
  state: HelpDeskState;
  onFilterNavigate?: (statusFilter: string) => void;
  onSuccessToast: (msg: string) => void;
}

export function HelpDeskOverview({
  state,
  onFilterNavigate,
  onSuccessToast,
}: HelpDeskOverviewProps) {
  const router = useRouter();
  const [selectedRange, setSelectedRange] = useState<'Today' | '7D' | '30D' | 'Quarter'>('30D');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const { kpis, tickets, agents } = state;

  const handleKpiClick = (status: string) => {
    if (onFilterNavigate) {
      onFilterNavigate(status);
    } else {
      router.push(`/helpdesk/all-tickets?status=${encodeURIComponent(status)}`);
    }
  };

  const handleExportOverviewCsv = () => {
    const csvContent = [
      'Ticket Number,Subject,Employee,Department,Category,Priority,Status,SLA Status,Created Date',
      ...tickets.map(
        (t) =>
          `"${t.ticketNumber}","${t.subject.replace(/"/g, '""')}","${t.employeeName}","${t.department}","${t.category}","${t.priority}","${t.status}","${t.slaStatus}","${t.createdDate}"`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OFC360_HelpDesk_Report_${selectedRange}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onSuccessToast('Help Desk overview report exported as CSV.');
  };

  // KPI card configs
  const kpiCards = [
    {
      id: 'total',
      title: 'Total Tickets',
      value: kpis.totalTickets,
      sub: '+14% vs last period',
      statusTarget: 'All',
      color: 'indigo',
      icon: Ticket,
    },
    {
      id: 'open',
      title: 'Open Tickets',
      value: kpis.openTickets,
      sub: 'Awaiting triage',
      statusTarget: 'Open',
      color: 'blue',
      icon: Clock,
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      value: kpis.inProgressTickets,
      sub: 'Being investigated',
      statusTarget: 'In Progress',
      color: 'amber',
      icon: TrendingUp,
    },
    {
      id: 'pending',
      title: 'Pending Tickets',
      value: kpis.pendingTickets,
      sub: 'Awaiting employee reply',
      statusTarget: 'Pending',
      color: 'purple',
      icon: Users,
    },
    {
      id: 'resolved',
      title: 'Resolved Tickets',
      value: kpis.resolvedTickets,
      sub: '98.2% first-contact CSAT',
      statusTarget: 'Resolved',
      color: 'emerald',
      icon: CheckCircle2,
    },
    {
      id: 'breached',
      title: 'SLA Breached',
      value: kpis.slaBreachedTickets,
      sub: 'Requires tier-2 attention',
      statusTarget: 'Escalated',
      color: 'rose',
      icon: AlertOctagon,
    },
    {
      id: 'avg_response',
      title: 'Avg First Response',
      value: `${kpis.avgFirstResponseTimeMinutes}m`,
      sub: 'Target: < 30 mins',
      statusTarget: 'All',
      color: 'teal',
      icon: Clock,
    },
    {
      id: 'avg_resolution',
      title: 'Avg Resolution Time',
      value: `${kpis.avgResolutionTimeHours}h`,
      sub: 'Target: < 24 hrs',
      statusTarget: 'Resolved',
      color: 'cyan',
      icon: BarChart2,
    },
  ];

  // Category distributions
  const categoryCounts = [
    { name: 'Payroll Support', count: tickets.filter((t) => t.category === 'Payroll Support').length, pct: 38 },
    { name: 'Attendance Support', count: tickets.filter((t) => t.category === 'Attendance Support').length, pct: 25 },
    { name: 'IT Support', count: tickets.filter((t) => t.category === 'IT Support').length, pct: 15 },
    { name: 'Leave Support', count: tickets.filter((t) => t.category === 'Leave Support').length, pct: 12 },
    { name: 'HR Support', count: tickets.filter((t) => t.category === 'HR Support').length, pct: 10 },
  ];

  // Department breakdown
  const departmentCounts = [
    { name: 'Engineering', count: 4, pct: 50 },
    { name: 'Product & Design', count: 2, pct: 25 },
    { name: 'Enterprise Sales', count: 1, pct: 12 },
    { name: 'Finance & Legal', count: 1, pct: 13 },
  ];

  return (
    <div className="space-y-6" data-testid="helpdesk-overview-dashboard">
      {/* 1. TOP CONTROLS & FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Support Desk Analytics Pulse
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enterprise service level agreements, ticket velocity &amp; agent capacities
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            {(['Today', '7D', '30D', 'Quarter'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRange(r)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedRange === r
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product & Design">Product &amp; Design</option>
            <option value="Enterprise Sales">Enterprise Sales</option>
            <option value="Finance & Legal">Finance &amp; Legal</option>
          </select>

          {/* Export CSV CTA */}
          <button
            type="button"
            onClick={handleExportOverviewCsv}
            data-testid="helpdesk-export-csv-btn"
            className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. 8 ENTERPRISE KPI CARDS (ALL CLICKABLE & NAVIGABLE) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {kpiCards.map((kpi) => {
          const IconComp = kpi.icon;
          return (
            <button
              key={kpi.id}
              type="button"
              onClick={() => handleKpiClick(kpi.statusTarget)}
              data-testid={`helpdesk-kpi-${kpi.id}`}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 dark:hover:border-indigo-500 text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 transition-colors">
                  <IconComp className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                  {kpi.value}
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
              </div>

              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {kpi.sub}
              </p>
            </button>
          );
        })}
      </div>

      {/* 3. ANALYTICS GRAPHS & DISTRIBUTION PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Volume Trends Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Ticket Inflow &amp; Resolution Velocity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily incoming tickets vs resolved service requests
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
              96.2% Resolved SLA
            </span>
          </div>

          {/* Interactive Bar Chart Visualization */}
          <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2 border-b border-slate-100 dark:border-slate-800">
            {[
              { day: 'Mon', inbound: 14, resolved: 12 },
              { day: 'Tue', inbound: 19, resolved: 16 },
              { day: 'Wed', inbound: 22, resolved: 20 },
              { day: 'Thu', inbound: 17, resolved: 18 },
              { day: 'Fri', inbound: 25, resolved: 23 },
              { day: 'Sat', inbound: 8, resolved: 9 },
              { day: 'Sun', inbound: 4, resolved: 5 },
            ].map((col) => (
              <div key={col.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="w-full max-w-[28px] flex items-end gap-1 h-32">
                  <div
                    style={{ height: `${(col.inbound / 25) * 100}%` }}
                    className="flex-1 bg-indigo-500/80 rounded-t-md transition-all group-hover:bg-indigo-600"
                    title={`Inbound: ${col.inbound}`}
                  />
                  <div
                    style={{ height: `${(col.resolved / 25) * 100}%` }}
                    className="flex-1 bg-emerald-500/80 rounded-t-md transition-all group-hover:bg-emerald-600"
                    title={`Resolved: ${col.resolved}`}
                  />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">{col.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" /> Inbound Tickets
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Resolved Tickets
              </span>
            </div>
            <span className="font-mono text-slate-400">Total 109 This Week</span>
          </div>
        </div>

        {/* Right: Employee Satisfaction (CSAT) & SLA Compliance */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              CSAT &amp; SLA Compliance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified employee post-resolution feedback
            </p>
          </div>

          <div className="text-center py-2 space-y-1">
            <div className="text-4xl font-black font-mono text-slate-900 dark:text-white">
              {kpis.csatScore} <span className="text-sm text-slate-400 font-normal">/ 5.0</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              96.4% Positive Ratings (182 Surveys)
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-600 dark:text-slate-400">First Response SLA Target</span>
              <span className="text-slate-900 dark:text-white font-mono">98.1% Met</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98.1%' }} />
            </div>

            <div className="flex justify-between font-semibold pt-1">
              <span className="text-slate-600 dark:text-slate-400">Resolution SLA Target</span>
              <span className="text-slate-900 dark:text-white font-mono">95.4% Met</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '95.4%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. CATEGORY BREAKDOWN & AGENT PERFORMANCE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Category Breakdown */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Tickets by Category
          </h3>
          <div className="space-y-3">
            {categoryCounts.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                  <span className="font-mono text-slate-500">{cat.count} tickets ({cat.pct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Agent Availability & Workload */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Agent Capacity &amp; Performance
            </h3>
            <span className="text-xs font-mono text-slate-500">{agents.length} Dedicated Agents</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {agents.map((agent) => (
              <div key={agent.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0">
                    {agent.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{agent.name}</p>
                    <p className="text-[11px] text-slate-500">{agent.department} · {agent.assignedTicketsCount} active</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      agent.availabilityStatus === 'Available'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : agent.availabilityStatus === 'Busy'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {agent.availabilityStatus}
                  </span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    {agent.currentWorkloadScore}% Load
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
